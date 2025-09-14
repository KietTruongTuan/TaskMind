from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import json
from together import Together
import dotenv
from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent.parent.parent
dotenv.load_dotenv(os.path.join(BASE_DIR, '.env'))

# Create your views here.
class GoalBreakdownView(APIView):
    """
    API endpoint that takes a goal's name, description, category, and due date,
    and returns a list of actionable tasks to achieve that goal using Together AI."""
    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description')
        category = request.data.get('category')
        due_date = request.data.get('due_date')

        if not name:
            return Response({"error": "Please provide a goal's name "}, status=status.HTTP_400_BAD_REQUEST)
        
        if not description:
            return Response({"error": "Please provide a goal's description "}, status=status.HTTP_400_BAD_REQUEST)
        
        if not due_date:
            return Response({"error": "Please provide a goal's due date "}, status=status.HTTP_400_BAD_REQUEST)

        if not category:
            return Response({"error": "Please provide a goal's category "}, status=status.HTTP_400_BAD_REQUEST)

        api_key = self.get_api_key()
        if not api_key:
            return Response({"error": "Together AI API Key is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        prompt = self.build_prompt(name, description, due_date)
        try:
            result = {}
            result["name"] = name
            result["task"] = self.get_tasks_from_ai(prompt, api_key)
            result["category"] = category
            result["due_date"] = due_date
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_api_key(self):
        return os.getenv("TOGETHER_API_KEY")

    def build_prompt(self, name, description, due_date):
        return (
            f"""You are an excellent project management assistant.
            Here is a new goal:
            Name: '{name}'
            Description: '{description}'
            Due_date: '{due_date}'
            Please help me break down this goal name and description into specific, actionable steps.
            Each step should be a clear, achievable task within due date.
            Please return the list of tasks as a JSON array of strings.
            Example:
            If the name is "Complete a graduation project on Fanpage Management" and description is "A project to manage a fanpage for a product" and due_date is "2023-12-31", return the result in the following format:
            ["Step 1: Design Database", "Step 2: Build API Login", "Step 3: Integrate Facebook API", "Step 4: Build management interface", "Step 5: Test and fix bugs", "Step 6: Write report and prepare presentation"]
            """
        )

    def get_tasks_from_ai(self, prompt, api_key):
        TOGETHER_AI_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"
        client = Together(api_key=api_key)
        response_stream = client.chat.completions.create(
            model=TOGETHER_AI_MODEL,
            messages=[
                {"role": "system",
                    "content": "You are a helpful project management assistant."},
                {"role": "user", "content": prompt}
            ],
            stream=True
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
