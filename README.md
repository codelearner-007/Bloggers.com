1. Install a react project using 
npm create vite@latest
and remaining processes

2. install react-router-dom using
npm install react-router-dom
for the routing in front end

3. Complete the basic design of front end like Home | Signup | Login Pages without using states and react hooks.
 
4. Start working on backend process

5. make the "backend" folder and activate it through "cd backend

6. create virtual environment using
python -m venv .venv
and then activate it using
--if powershell then .\.venv\Script\Activate.ps1
--if cmd then .\.venv\Script\activate.bat

7. Create a "requirements.txt" file and save all the package with versions

8. Database connection for that make different file lile
   database.py | config.py | .env | main.py

9. after that we create our "models.py" and create User Table

10. create a "user.py" file and create differnet request like
    create request | get_user request 
    and set the APIRouter with the main file

11. Also create the "utils.py" file 
   Make a hash function for hashing the password while creating the user

12. Then create 
   login.py | authentication.py | files for the login process with authentication 
   
   In "login.py" =====>> We check the credentials send by the user from front end and if 
      It matches, it create the token
   
   In "authentication.py" =====>> We create the encrypted_token with Expire time and 
      send back it to "login.py file

13. After this step our backend user login with authentication is complete and now we are going 
   back to front end and connect it with backend data 

14. 1st setup the signup.jsx 
   for password validation install
   npm install --save react-password-checklist 
   for strong password


"""add username column to user table

Revision ID: 1234567abc04
Revises: 1234567abc03
Create Date: 2025-10-09 11:16:34.783763

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1234567abc04'
down_revision: Union[str, Sequence[str], None] = '1234567abc03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 
    op.add_column('users',sa.Column('username', sa.String(), unique=True , nullable=True ))
   
    conn = op.get_bind()
    users = conn.execute(sa.text("SELECT id FROM users")).fetchall()
    for i, row in enumerate(users):
       conn.execute(sa.text("UPDATE users SET username = "),{"uname": f"user_{i+1}", "id": row.id})
    
    op.alter_column('users', 'username', nullable=False)

    op.create_unique_constraint('uq_users_username', 'users', '[username]')

def downgrade() -> None:
    op.drop_constraint('uq_users_username' , 'users' , type_= 'unique')
    op.drop_column('users', 'username')