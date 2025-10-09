"""create like table

Revision ID: 1234567abc03
Revises: 1234567abc02
Create Date: 2025-10-02 15:13:01.338806

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1234567abc03'
down_revision: Union[str, Sequence[str], None] = '1234567abc02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'likes',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('blog_id', sa.Integer(), sa.ForeignKey('blogs.id', ondelete='CASCADE'), primary_key=True),
    )


def downgrade() -> None:
    op.drop_table('likes')
    pass
