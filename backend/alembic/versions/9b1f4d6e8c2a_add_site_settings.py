"""add site settings

Revision ID: 9b1f4d6e8c2a
Revises: 728cac6ea234
Create Date: 2026-07-07 02:42:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9b1f4d6e8c2a"
down_revision: Union[str, None] = "728cac6ea234"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "site_settings",
        sa.Column("key", sa.String(length=120), nullable=False),
        sa.Column("value", sa.String(length=255), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )
    op.execute("INSERT INTO site_settings (key, value) VALUES ('site_mode', 'panel')")


def downgrade() -> None:
    op.drop_table("site_settings")
