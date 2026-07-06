
import sys
from pathlib import Path
import re

sys.path.insert(0, str(Path(__file__).resolve().parent))

import os

from sqlalchemy import create_engine, text
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext

# Import Base and models
from app.database import Base
from app import models  # noqa: F401 - registers models with Base.metadata

database_url = os.getenv("DATABASE_URL")
schema_name = os.getenv("SCHEMA_NAME", "public")

if not database_url:
    print("VERIFICATION_ERROR: DATABASE_URL environment variable is not set")
    sys.exit(1)

if not re.match(r"^[a-z_][a-z0-9_]{0,62}$", schema_name):
    print("VERIFICATION_ERROR: SCHEMA_NAME must be a valid PostgreSQL identifier")
    sys.exit(1)

engine = create_engine(database_url)
try:
    with engine.connect() as conn:
        # Set search_path for schema isolation
        conn.execute(text(f'SET search_path TO "{schema_name}"'))
        conn.commit()

        # Configure migration context and compare
        mc = MigrationContext.configure(conn)
        diff = compare_metadata(mc, Base.metadata)

        if not diff:
            print("SCHEMA_VERIFIED")
        else:
            # Format diff for human readability
            print("SCHEMA_MISMATCH")
            for item in diff[:10]:  # Limit output
                print(f"  - {item}")
            if len(diff) > 10:
                print(f"  ... and {len(diff) - 10} more differences")
except Exception as e:
    print(f"VERIFICATION_ERROR: {e}")
    sys.exit(1)
