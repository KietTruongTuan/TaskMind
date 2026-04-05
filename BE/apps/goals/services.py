import os
import json
import base64
import re
import logging
from openai import OpenAI
from pypdf import PdfReader
from docx import Document
from django.utils import timezone

logger = logging.getLogger(__name__)

class AIGoalGeneratorService:
    """Service class for handling AI goal generation and document parsing"""
    
    @staticmethod
    def get_api_key():
        return os.getenv("API_KEY")

    @staticmethod
    def get_ai_response(prompt, api_key, max_retries=3):
        """Get AI response with retry logic for network issues"""
        import time
        import httpx
        
        GROQ_MODEL = "groq/compound"
        
        for attempt in range(max_retries):
            try:
                client = OpenAI(
                    api_key=api_key,
                    base_url="https://api.groq.com/openai/v1",
                    timeout=60.0  # 60 second timeout
                )
                response_stream = client.chat.completions.create(
                    model=GROQ_MODEL,
                    messages=[
                        {"role": "system",
                            "content": "You are a helpful project management assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    stream=True,
                    temperature=0.7
                )
                full_content = ""
                for chunk in response_stream:
                    if hasattr(chunk, 'choices') and chunk.choices and chunk.choices[0].delta.content is not None:
                        full_content += chunk.choices[0].delta.content
                        
                if not full_content:
                    raise ValueError("No response received from AI.")

                return AIGoalGeneratorService.extract_json_response(full_content)
                
            except (httpx.RemoteProtocolError, httpx.ReadTimeout, ConnectionError) as e:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 2, 4, 6 seconds
                    time.sleep(wait_time)
                    continue
                else:
                    raise ValueError(f"AI service unavailable after {max_retries} attempts. Please try again later. Error: {str(e)}")

    @staticmethod
    def extract_json_response(text):
        # \s* means "zero or more whitespace characters."
        match = re.search(r"\[\s*[\s\S]*?\]", text)
        if match:
            json_array_response = match.group(0)
            try:
                tasks = json.loads(json_array_response)
                if not isinstance(tasks, list):
                    raise ValueError(
                        "AI did not return a JSON array as expected.")
                return tasks
            except (json.JSONDecodeError, ValueError):
                raise ValueError(
                    f"AI returned invalid format. Extracted: {json_array_response}")
        else:
            raise ValueError(
                f"Could not find a JSON array in AI response. Content: {text}")

    @staticmethod
    def extract_context_from_files(files, api_key):
        context_parts = []
        for file in files:
            ext = os.path.splitext(file.name)[1].lower()
            try:
                if ext == '.pdf':
                    reader = PdfReader(file)
                    text = ""
                    for page in reader.pages:
                        page_text = page.extract_text() or ""
                        if page_text:
                            text += page_text + "\n"
                    if text.strip():
                        context_parts.append(f"--- Document Content ({file.name}) ---\n{text.strip()}")
                elif ext == '.docx':
                    doc = Document(file)
                    text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
                    if text.strip():
                        context_parts.append(f"--- Document Content ({file.name}) ---\n{text.strip()}")
                elif ext in ['.jpg', '.jpeg', '.png', '.webp']:
                    image_base64 = base64.b64encode(file.read()).decode('utf-8')
                    mime_type = file.content_type or f"image/{ext.lstrip('.')}" # example: image/jpeg
                    image_summary = AIGoalGeneratorService.analyze_image_with_vision(image_base64, api_key, mime_type)
                    if image_summary:
                        context_parts.append(f"--- Image Content Description ({file.name}) ---\n{image_summary.strip()}")
            except Exception as e:
                logger.warning("Failed to process file %s: %s", file.name, str(e), exc_info=True)
                continue
        return "\n\n".join(context_parts)

    @staticmethod
    def analyze_image_with_vision(base64_image, api_key, mime_type="image/jpeg"):
        """Use Groq's Vision model to extract context from an image."""
        try:
            client = OpenAI(
                api_key=api_key,
                base_url="https://api.groq.com/openai/v1",
                timeout=60.0
            )
            response = client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Describe the contents of this image. Extract any important text, diagrams, or requirements that could be relevant for a project goal."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1024
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
        return (
            f"""You are an excellent project management assistant.
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
        )
    
    @staticmethod
    def build_prompt_for_description(name, description, deadline):
        return (
            f"""You are an excellent project management assistant.
            Here is a new goal:
            Name: '{name}'
            Description: '{description}'
            Deadline: '{deadline}'
            Please help me rewrite the goal description in a summary to just understand the context with expected outcomes not so detailed.
            
            Must return the rewritten description as a string inside a JSON array.
            
            The return language should match the name and description language.
            """
        )

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


class GoalService:
    @staticmethod
    def sync_goal_completion_status(goal):
        """Syncs the goal's completion status based on its tasks."""
        if GoalService._should_complete_goal(goal):
            GoalService._mark_goal_completed(goal)

    @staticmethod
    def _should_complete_goal(goal):
        return goal.tasks.exists() and GoalService._are_all_tasks_completed(goal)

    @staticmethod
    def _are_all_tasks_completed(goal):
        return not goal.tasks.exclude(status="Completed").exists()

    @staticmethod
    def _mark_goal_completed(goal):
        if goal.status != "Completed":
            goal.status = "Completed"
            goal.complete_date = timezone.now().date()
            goal.save(update_fields=["status", "complete_date"])
