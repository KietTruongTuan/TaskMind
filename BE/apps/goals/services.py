import base64
import json
import logging
import os
import random
import re
import time
from datetime import date
from uuid import uuid4

import httpx
from django.db.models import Count, Q, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from docx import Document
from openai import OpenAI
from pypdf import PdfReader

from .models import Goal, Task

logger = logging.getLogger(__name__)


class AIGoalGeneratorService:
    """Service class for handling AI goal generation and document parsing"""

    @staticmethod
    def get_api_key():
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise ValueError("AI API Key is not configured.")
        return api_key

    @staticmethod
    def get_base_url():
        base_url = os.getenv("AI_BASE_URL")
        if not base_url:
            raise ValueError("AI Base URL is not configured.")
        return base_url

    @staticmethod
    def get_ai_text_model():
        model = os.getenv("AI_TEXT_MODEL")
        if not model:
            raise ValueError("AI Text model is not configured.")
        return model

    @staticmethod
    def get_ai_response(prompt, api_key, base_url, model, max_retries=3):
        """Get AI response with retry logic for network issues"""
        correlation_id = str(uuid4())[:8]

        logger.info(
            "AI request started",
            extra={
                "correlation_id": correlation_id,
                "model": model,
                "prompt_length": len(prompt),
                "max_retries": max_retries,
            },
        )

        for attempt in range(max_retries):
            try:
                result = AIGoalGeneratorService._execute_generation_attempt(
                    prompt, api_key, base_url, model, correlation_id, attempt
                )
                return result

            except (httpx.RemoteProtocolError, httpx.ReadTimeout, ConnectionError) as e:
                if attempt < max_retries - 1:
                    wait_time = min((2 ** attempt) + random.uniform(0, 1), 30)
                    logger.warning(
                        "AI request retrying",
                        extra={
                            "correlation_id": correlation_id,
                            "attempt": attempt + 1,
                            "max_retries": max_retries,
                            "error_type": type(e).__name__,
                            "wait_seconds": round(wait_time, 2),
                        },
                    )
                    time.sleep(wait_time)
                    continue
                else:
                    logger.error(
                        "AI request exhausted retries",
                        extra={
                            "correlation_id": correlation_id,
                            "attempts": max_retries,
                            "error_type": type(e).__name__,
                            "error_detail": str(e)[:500],
                        },
                    )
                    raise ValueError(
                        f"AI service unavailable after {max_retries} attempts. Please try again later. Error: {str(e)}"
                    )

    @staticmethod
    def _execute_generation_attempt(prompt, api_key, base_url, model, correlation_id="", attempt=0):
        start_time = time.time()
        client = OpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=60.0,  # 60 second timeout
        )
        try:
            response_stream = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful project management assistant.",
                    },
                    {"role": "user", "content": prompt},
                ],
                stream=True,
                temperature=0.7,
            )
        except Exception as e:
            latency_ms = (time.time() - start_time) * 1000
            logger.error(
                "AI provider error",
                extra={
                    "correlation_id": correlation_id,
                    "attempt": attempt + 1,
                    "error_type": type(e).__name__,
                    "error_code": getattr(e, "status_code", None),
                    "latency_ms": round(latency_ms, 1),
                    "error_detail": str(e)[:500],
                },
                exc_info=True,
            )
            raise ValueError(f"AI Provider Error: {str(e)}")

        # Delegate chunk processing
        full_content = AIGoalGeneratorService._process_response_stream(response_stream)

        latency_ms = (time.time() - start_time) * 1000

        if not full_content:
            logger.warning(
                "AI returned empty response",
                extra={"correlation_id": correlation_id, "latency_ms": round(latency_ms, 1)},
            )
            raise ValueError("No response received from AI.")

        logger.info(
            "AI request succeeded",
            extra={
                "correlation_id": correlation_id,
                "attempt": attempt + 1,
                "response_length": len(full_content),
                "latency_ms": round(latency_ms, 1),
            },
        )

        return AIGoalGeneratorService.extract_json_response(full_content)

    @staticmethod
    def _process_response_stream(response_stream):
        full_content = ""
        for chunk in response_stream:
            if (
                hasattr(chunk, "choices")
                and chunk.choices
                and chunk.choices[0].delta.content is not None
            ):
                full_content += chunk.choices[0].delta.content
        return full_content

    @staticmethod
    def extract_json_response(text):
        # \s* means "zero or more whitespace characters."
        match = re.search(r"\[\s*[\s\S]*?\]", text)
        if match:
            json_array_response = match.group(0)
            try:
                tasks = json.loads(json_array_response)
                if not isinstance(tasks, list):
                    raise ValueError("AI did not return a JSON array as expected.")
                return tasks
            except (json.JSONDecodeError, ValueError):
                raise ValueError(
                    f"AI returned invalid format. Extracted: {json_array_response}"
                )
        else:
            raise ValueError(
                f"Could not find a JSON array in AI response. Content: {text}"
            )

    @staticmethod
    def extract_context_from_files(files, api_key):
        context_parts = []
        for file in files:
            try:
                text = AIGoalGeneratorService._process_single_file(file, api_key)

                if text:
                    context_parts.append(text)
            except Exception as e:
                logger.warning(
                    "Failed to process file %s: %s", file.name, str(e), exc_info=True
                )

        return "\n\n".join(context_parts)

    @staticmethod
    def _process_single_file(file, api_key):
        ext = os.path.splitext(file.name)[1].lower()
        if ext == ".pdf":
            return AIGoalGeneratorService._extract_pdf_text(file)
        elif ext == ".docx":
            return AIGoalGeneratorService._extract_docx_text(file)
        elif ext in [".jpg", ".jpeg", ".png", ".webp"]:
            return AIGoalGeneratorService._extract_image_context(file, api_key, ext)

    @staticmethod
    def _extract_pdf_text(file):
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text:
                text += page_text + "\n"
        if text.strip():
            return f"--- Document Content ({file.name}) ---\n{text.strip()}"

    @staticmethod
    def _extract_docx_text(file):
        doc = Document(file)
        text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        if text.strip():
            return f"--- Document Content ({file.name}) ---\n{text.strip()}"

    @staticmethod
    def _extract_image_context(file, api_key, ext):
        image_base64 = base64.b64encode(file.read()).decode("utf-8")
        mime_type = (
            file.content_type or f"image/{ext.lstrip('.')}"
        )  # example: image/jpeg
        image_summary = AIGoalGeneratorService.analyze_image_with_vision(
            image_base64, api_key, mime_type
        )
        if image_summary:
            return f"--- Image Content Description ({file.name}) ---\n{image_summary.strip()}"

    @staticmethod
    def analyze_image_with_vision(base64_image, api_key, mime_type="image/jpeg"):
        """Use Groq's Vision model to extract context from an image."""
        try:
            client = OpenAI(
                api_key=api_key, base_url="https://api.groq.com/openai/v1", timeout=60.0
            )
            response = client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Describe the contents of this image. Extract any important text, diagrams, or requirements that could be relevant for a project goal.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1024,
            )
            if response.choices and response.choices[0].message.content:
                return response.choices[0].message.content
            # If no usable content is returned, do not inject a placeholder into the prompt.
            return None
        except Exception as e:
            logger.error("Vision API Error for image: %s", str(e), exc_info=True)
            # On failure, return None so callers can skip adding this to the prompt.
            return None

    @staticmethod
    def build_prompt_for_task(name, description, deadline):
        return f"""You are an excellent project management assistant.
            Here is a new goal:
            Name: '{name}'
            Description: '{description}'
            Deadline: '{deadline}'
            Please help me break down this goal name and description into specific, actionable steps from {timezone.now().date().isoformat()} to "{deadline}".
            Each step should be a clear, achievable task within deadline.
            
            Must return the list of tasks as a JSON array of strings.
            
            The return language should match the name and description language.
            
            Example:
            If the name is "Complete a graduation project on Fanpage Management" and description is "A project to manage a fanpage for a product" and deadline is "2023-12-31" and start date is "2023-09-29", return the result in the following format:
            
            [
                {{
                    "name": "Design Database",
                    "status": "ToDo",
                    "deadline": "2023-10-01",
                }}, 
                {{
                    "name": "Build API Login",
                    "status": "ToDo",
                    "deadline": "2023-10-15",
                }}, 
                {{  
                    "name": "Integrate Facebook API",
                    "status": "ToDo",
                    "deadline": "2023-11-01",
                }},
                {{
                    "name": "Build management interface",
                    "status": "ToDo",
                    "deadline": "2023-11-15",
                }},
                {{
                    "name": "Test and fix bugs",
                    "status": "ToDo",
                    "deadline": "2023-12-15",
                }},
                {{
                    "name": "Write report and prepare presentation",
                    "status": "ToDo",
                    "deadline": "2023-12-31",
                }}
            ]
            """

    @staticmethod
    def build_prompt_for_description(name, description, deadline):
        return f"""You are an excellent project management assistant.
            Here is a new goal:
            Name: '{name}'
            Description: '{description}'
            Deadline: '{deadline}'
            Please help me rewrite the goal description in a summary to just understand the context with expected outcomes not so detailed.
            
            Must return the rewritten description as a string inside a JSON array.
            
            The return language should match the name and description language.
            """


class GoalService:
    @staticmethod
    def sync_goal_completion_status(goal):
        """Syncs the goal's completion status based on its tasks."""
        if GoalService._has_completed_all_tasks(goal):
            GoalService._mark_goal_completed(goal)

    @staticmethod
    def _has_completed_all_tasks(goal):
        return (
            goal.tasks.exists() and not goal.tasks.exclude(status="Completed").exists()
        )

    @staticmethod
    def _mark_goal_completed(goal):
        if goal.status != "Completed":
            goal.status = "Completed"
            goal.complete_date = timezone.now().date()
            goal.save(update_fields=["status", "complete_date"])

    @staticmethod
    def prepare_goal_update(goal, validated_data):
        if GoalService._is_status_change_to_completed(goal, validated_data):
            GoalService._set_completion_date(validated_data)

    @staticmethod
    def _is_status_change_to_completed(goal, validated_data):
        new_status = validated_data.get("status")
        return new_status == "Completed" and goal.status != "Completed"

    @staticmethod
    def _set_completion_date(validated_data):
        validated_data["complete_date"] = timezone.now().date()

    @staticmethod
    def get_filtered_goals(user, query_params):
        goals = Goal.objects.filter(user=user)

        goals = GoalService._apply_status_filter(goals, query_params.get("status"))
        goals = GoalService._apply_search_filter(goals, query_params.get("search"))
        goals = GoalService._apply_tag_filter(goals, query_params.get("tag"))
        goals = GoalService._apply_date_filter(goals, query_params)

        return goals

    @staticmethod
    def _apply_status_filter(goals, status_filter):
        if status_filter:
            status_list = [s.strip() for s in status_filter.split(",")]
            goals = goals.filter(status__in=status_list)
        return goals

    @staticmethod
    def _apply_search_filter(goals, search_query):
        if search_query:
            goals = goals.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )
        return goals

    @staticmethod
    def _apply_tag_filter(goals, tag_filter):
        if tag_filter:
            tag_list = [t.strip() for t in tag_filter.split(",")]
            goals = goals.filter(tag__contains=tag_list)
        return goals

    @staticmethod
    def _apply_date_filter(goals, query_params):
        # Apply filters
        start_date_filter = query_params.get("startDate", None)
        end_date_filter = query_params.get("endDate", None)

        if start_date_filter:
            goals = goals.filter(created_at__date__gte=start_date_filter)

        if end_date_filter:
            goals = goals.filter(created_at__date__lte=end_date_filter)

        return goals

    @staticmethod
    def build_goal_list_response(serializer_data):
        counts = GoalService._count_status(serializer_data)

        response_data = {
            "goals": serializer_data,
            "totalCount": len(serializer_data),
            "toDoCount": counts["ToDo"],
            "inProgressCount": counts["InProgress"],
            "completedCount": counts["Completed"],
            "onHoldCount": counts["OnHold"],
            "cancelledCount": counts["Cancelled"],
            "overdueCount": counts["Overdue"],
        }

        return response_data

    @staticmethod
    def _count_status(serializer_data):
        counts = GoalService._get_default_counts()

        for goal in serializer_data:
            counts[goal["status"]] += 1

        return counts

    @staticmethod
    def _get_default_counts():
        return {
            "ToDo": 0,
            "InProgress": 0,
            "Completed": 0,
            "OnHold": 0,
            "Cancelled": 0,
            "Overdue": 0,
        }

    @staticmethod
    def get_unique_tags(user):
        raw_tags = GoalService._fetch_user_tags(user)
        return GoalService._extract_and_deduplicate_tags(raw_tags)

    @staticmethod
    def _fetch_user_tags(user):
        return Goal.objects.filter(user=user).values_list("tag", flat=True)

    @staticmethod
    def _extract_and_deduplicate_tags(raw_tags_lists):
        unique_tags = set()
        for tags in raw_tags_lists:
            if isinstance(tags, list):
                unique_tags.update(tags)
        return sorted(list(unique_tags))


class TaskService:
    @staticmethod
    def prepare_task_update(task, validated_data):
        """Update the task completion date if the task status change to complete"""
        if TaskService._is_status_changed_to_completed(task, validated_data):
            TaskService._set_completion_date(validated_data)

    @staticmethod
    def _is_status_changed_to_completed(task, validated_data):
        new_status = validated_data.get("status")
        return new_status == "Completed" and task.status != "Completed"

    @staticmethod
    def _set_completion_date(validated_data):
        validated_data["complete_date"] = timezone.now().date()

    @staticmethod
    def get_prepared_tasks(user, query_params):
        tasks = Task.objects.filter(goal__user=user)

        tasks = TaskService._apply_status_filter(tasks, query_params.get("status"))
        tasks = TaskService._apply_goal_id_filter(tasks, query_params.get("goalId"))
        tasks = TaskService._apply_search_query(tasks, query_params.get("search"))

        tasks = TaskService._apply_task_ordering(tasks)

        return tasks

    @staticmethod
    def _apply_status_filter(tasks, status_filter):
        if status_filter:
            status_list = [s.strip() for s in status_filter.split(",")]
            tasks = tasks.filter(status__in=status_list)
        return tasks

    @staticmethod
    def _apply_goal_id_filter(tasks, goal_id_filter):
        if goal_id_filter:
            tasks = tasks.filter(goal_id=goal_id_filter)
        return tasks

    @staticmethod
    def _apply_search_query(tasks, search_query):
        if search_query:
            tasks = tasks.filter(name__icontains=search_query)
        return tasks

    @staticmethod
    def _apply_task_ordering(tasks):
        return tasks.select_related("goal").order_by(
            Coalesce("deadline", Value(date.max)), "created_at"
        )

    @staticmethod
    def build_task_list_response(serializer_data):
        counts = TaskService._count_status(serializer_data)

        response_data = {
            "tasks": serializer_data,
            "totalCount": len(serializer_data),
            "toDoCount": counts["ToDo"],
            "inProgressCount": counts["InProgress"],
            "completedCount": counts["Completed"],
            "onHoldCount": counts["OnHold"],
            "cancelledCount": counts["Cancelled"],
            "overdueCount": counts["Overdue"],
        }

        return response_data

    @staticmethod
    def _count_status(serializer_data):
        counts = TaskService._get_default_counts()

        for task in serializer_data:
            counts[task["status"]] += 1

        return counts

    @staticmethod
    def _get_default_counts():
        return {
            "ToDo": 0,
            "InProgress": 0,
            "Completed": 0,
            "OnHold": 0,
            "Cancelled": 0,
            "Overdue": 0,
        }


class ContributionService:
    @staticmethod
    def get_yearly_productivity(user, year: int) -> list[dict]:
        raw_counts = ContributionService._fetch_daily_counts(user, year)
        padded_counts = ContributionService._ensure_boundary_dates(raw_counts, year)
        return ContributionService._build_response_list(padded_counts)

    @staticmethod
    def _fetch_daily_counts(user, year: int) -> dict[str, int]:
        queryset = (
            Task.objects.filter(
                goal__user=user, status="Completed", complete_date__year=year
            )
            .values("complete_date")
            .annotate(count=Count("id"))
        )

        # transform queryset into dict: {'YYYY-MM-DD': count}
        return {
            row["complete_date"].strftime("%Y-%m-%d"): row["count"]
            for row in queryset
            if row["complete_date"]
        }

    @staticmethod
    def _ensure_boundary_dates(
        daily_counts: dict[str, int], year: int
    ) -> dict[str, int]:
        """Ensures Jan 1st and Dec 31st exist in the data mapping."""
        daily_counts.setdefault(f"{year}-01-01", 0)
        daily_counts.setdefault(f"{year}-12-31", 0)

        return daily_counts

    @staticmethod
    def _build_response_list(daily_counts: dict[str, int]) -> list[dict]:
        response_list = [
            {
                "date": date_str,
                "count": count,
                "level": ContributionService._determine_level(count),
            }
            for date_str, count in daily_counts.items()
        ]

        return sorted(response_list, key=lambda dict_item: dict_item["date"])

    @staticmethod
    def _determine_level(task_count: int) -> int:
        if task_count >= 10:
            return 4
        if task_count >= 5:
            return 3
        if task_count >= 3:
            return 2
        if task_count >= 1:
            return 1
        return 0


class GoalBreakDownService:
    @staticmethod
    def generate_breakdown(data, files):
        """Orchestrates AI generation of tasks from a goal description."""
        name = data.get("name")
        description = data.get("description", "")
        tag = data.get("tag", "")
        deadline = data.get("deadline")

        api_key = AIGoalGeneratorService.get_api_key()

        base_url = AIGoalGeneratorService.get_base_url()

        text_model = AIGoalGeneratorService.get_ai_text_model()

        enhanced_desc = GoalBreakDownService._prepare_enhanced_description(
            description, files, api_key
        )

        tasks = GoalBreakDownService._fetch_ai_tasks(
            name, enhanced_desc, deadline, api_key, base_url, text_model
        )
        final_desc = GoalBreakDownService._fetch_ai_description(
            name, enhanced_desc, deadline, api_key, base_url, text_model
        )

        return GoalBreakDownService._build_final_result(
            name, final_desc, deadline, tag, tasks
        )

    @staticmethod
    def _prepare_enhanced_description(description, files, api_key):
        # Parse context from files
        file_context = AIGoalGeneratorService.extract_context_from_files(files, api_key)
        if file_context:
            description = (
                f"{description}\n\n[Additional Context from Files:]\n{file_context}"
                if description
                else file_context
            )
            return description
        return description

    @staticmethod
    def _fetch_ai_tasks(name, description, deadline, api_key, base_url, text_model):
        task_prompt = AIGoalGeneratorService.build_prompt_for_task(
            name, description, deadline
        )
        return AIGoalGeneratorService.get_ai_response(
            task_prompt, api_key, base_url, text_model
        )

    @staticmethod
    def _fetch_ai_description(
        name, description, deadline, api_key, base_url, text_model
    ):
        description_prompt = AIGoalGeneratorService.build_prompt_for_description(
            name, description, deadline
        )
        raw_response = AIGoalGeneratorService.get_ai_response(
            description_prompt, api_key, base_url, text_model
        )
        return GoalBreakDownService._parse_description_response(raw_response)

    @staticmethod
    def _parse_description_response(description_response):
        # Parse description response
        if isinstance(description_response, list):
            # It's already a list, just take the first item
            if description_response:
                description = description_response[0]
            else:
                description = ""  # Handle empty list case
        else:
            # It is a string, so NOW we try to parse it
            try:
                parsed_description = json.loads(description_response)

                if isinstance(parsed_description, list) and parsed_description:
                    description = parsed_description[0]
                else:
                    description = str(parsed_description)

            except (json.JSONDecodeError, TypeError):
                # Fallback: It was just a plain string all along
                description = description_response

        return description

    @staticmethod
    def _build_final_result(name, final_desc, deadline, tag, tasks):
        result = {}
        result["name"] = name
        result["description"] = final_desc
        result["status"] = "ToDo"
        result["deadline"] = deadline
        result["tag"] = tag
        result["completeCount"] = 0
        result["taskCount"] = len(tasks)
        result["tasks"] = tasks
        return result
