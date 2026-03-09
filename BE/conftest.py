import os

# Force SQLite for all test runs.
# This avoids NeonDB (remote Postgres) teardown failures:
#   - DuplicateDatabase: "test_neondb already exists" (from previous crashed test run)
#   - OperationalError: "database is being accessed by other users" (NeonDB connection pooling)
# Tests run faster and NeonDB stays untouched.
os.environ.setdefault("USE_POSTGRES", "False")
