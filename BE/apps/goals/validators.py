from django.utils import timezone

class GoalBreakdownValidator:
        # File upload limits
        MAX_FILES = 5
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB per file
        ALLOWED_EXTENSIONS = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".webp"]

        @classmethod
        def validate_request(cls, data, files):
            """Main entry point for validation. Returns an error string or None."""
            error = cls._validate_required_fields(data)
            if error: 
                return error
            
            error = cls._validate_deadline(data.get("deadline"))
            if error: 
                return error
            
            error =cls._validate_files(files)
            if error: 
                return error

            return None #None means validation passed successfully

        @classmethod
        def _validate_required_fields(cls, data):
            if not data.get("name"):
                return "Please provide a goal's name"
            if not data.get("deadline"):
                return "Please provide a goal's deadline"
            return None
        
        @classmethod
        def _validate_deadline(cls, deadline):
            if deadline < timezone.now().date().isoformat():
                return "Deadline must be a future date"
            return None

        @classmethod
        def _validate_files(cls, files):
            if len(files) > cls.MAX_FILES:
                return f"Maximum {cls.MAX_FILES} files allowed."
                
            for file in files:
                error = cls._validate_single_file(file)
                if error: 
                    return error
            return None
        
        @classmethod
        def _validate_single_file(cls, file):
            if file.size > cls.MAX_FILE_SIZE:
                return f"File '{file.name}' exceeds the 10MB size limit."
                
            ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else ""
            if f".{ext}" not in cls.ALLOWED_EXTENSIONS:
                return f"File '{file.name}' has an unsupported format. Allowed: PDF, DOCX, JPG, PNG, WebP."
            return None