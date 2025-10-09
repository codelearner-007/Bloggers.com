"""add username column in users table

Revision ID: 1234567abc04
Revises: 1234567abc03
Create Date: 2025-10-09 13:54:05.866320

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import random



# revision identifiers, used by Alembic.
revision: str = '1234567abc04'
down_revision: Union[str, Sequence[str], None] = '1234567abc03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1️⃣ Add the column (nullable first)
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))

    conn = op.get_bind()
    users = conn.execute(sa.text("SELECT id, email FROM users")).fetchall()

    used_usernames = set()  # to avoid duplicates

    for row in users:
        base_name = row.email.split('@')[0]

        # Generate a unique random 3-digit number
        while True:
            rand_number = str(random.randint(0, 999)).zfill(3)
            username = f"{base_name}{rand_number}"
            if username not in used_usernames:
                used_usernames.add(username)
                break

        conn.execute(
            sa.text("UPDATE users SET username = :uname WHERE id = :id"),
            {"uname": username, "id": row.id},
        )

    # 2️⃣ Make the column NOT NULL
    op.alter_column('users', 'username', nullable=False)

    # 3️⃣ Add unique constraint
    op.create_unique_constraint('uq_users_username', 'users', ['username'])