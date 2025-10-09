"""create blogs table

Revision ID: 1234567abc02
Revises: 1234567abc01
Create Date: 2025-09-25 19:33:36.771600

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '1234567abc02'
down_revision: Union[str, Sequence[str], None] = '1234567abc01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'blogs',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('published', sa.Boolean(), server_default=text("True"), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                  server_default=text('now()'), nullable=False),
        sa.Column('owner_id', sa.Integer(),
                  sa.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('blogs')
