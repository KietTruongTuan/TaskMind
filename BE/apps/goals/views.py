from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import json
from together import Together
import dotenv
from pathlib import Path
import re
from openai import OpenAI
from django.utils import timezone

BASE_DIR = Path(__file__).resolve().parent.parent.parent
dotenv.load_dotenv(os.path.join(BASE_DIR, '.env'))

# Create your views here.
class GoalBreakdownView(APIView):
    """
    API endpoint that takes a goal's name, description, tag, and deadline,
    and returns a list of actionable tasks to achieve that goal using the Groq API."""
    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description')
        tag = request.data.get('tag')
        deadline = request.data.get('deadline')

        if not name:
            return Response({"error": "Please provide a goal's name"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not description:
            return Response({"error": "Please provide a goal's description"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not deadline:
            return Response({"error": "Please provide a goal's deadline"}, status=status.HTTP_400_BAD_REQUEST)

        if deadline < timezone.now().date().isoformat():
            return Response({"error": "Deadline must be a future date"}, status=status.HTTP_400_BAD_REQUEST)
        # if not tag:
        #     return Response({"error": "Please provide a goal's tag"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = self.get_api_key()
        if not api_key:
            return Response({"error": "Together AI API Key is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        task_prompt = self.build_prompt_for_task(name, description, deadline)
        description_prompt = self.build_prompt_for_description(name, description, deadline)
        task_list = self.get_ai_response(task_prompt, api_key)
        try:
            result = {}
            result["name"] = name
            result["description"] = self.get_ai_response(description_prompt, api_key)
            result["status"] = "ToDo"
            result["deadline"] = deadline
            result["tag"] = tag
            result["completeCount"] = 0
            result["taskCount"] = len(task_list)
            result["tasks"] = task_list
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_api_key(self):
        return os.getenv("API_KEY")

    def get_ai_response(self, prompt, api_key):
        # TOGETHER_AI_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"
        GROQ_MODEL = "groq/compound"
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"    
        )
        response_stream = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system",
                    "content": "You are a helpful project management assistant."},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            temperature=0.7 # Adjust temperature for creativity if needed
        )
        full_content = ""
        for chunk in response_stream:
            if hasattr(chunk, 'choices') and chunk.choices and chunk.choices[0].delta.content is not None:
                full_content += chunk.choices[0].delta.content
        if not full_content:
            raise ValueError("No response received from AI.")

        return self.extract_json_response(full_content)

    def extract_json_response(self, text):
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
            
    def build_prompt_for_task(self, name, description, deadline):
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
    
    def build_prompt_for_description(self, name, description, deadline):
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
