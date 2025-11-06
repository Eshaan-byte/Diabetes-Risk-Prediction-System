"""
Database migration script to add email verification fields to users table.
Run this once to update your existing database schema.

Usage:
    python -m app.migrate_email_verification
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database connection details
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def migrate():
    """Add email verification columns to users table if they don't exist"""
    engine = create_engine(DATABASE_URL)

    with engine.connect() as connection:
        print("Starting database migration for email verification...")

        try:
            # Check if columns already exist
            result = connection.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'users'
                AND column_name IN ('is_verified', 'verification_token', 'verification_token_expiry')
            """))
            existing_columns = [row[0] for row in result]

            if len(existing_columns) == 3:
                print("✓ All email verification columns already exist. No migration needed.")
                return

            # Add is_verified column if it doesn't exist
            if 'is_verified' not in existing_columns:
                print("Adding 'is_verified' column...")
                connection.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
                """))
                connection.commit()
                print("✓ Added 'is_verified' column")
            else:
                print("✓ 'is_verified' column already exists")

            # Add verification_token column if it doesn't exist
            if 'verification_token' not in existing_columns:
                print("Adding 'verification_token' column...")
                connection.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN verification_token VARCHAR(255)
                """))
                connection.commit()
                print("✓ Added 'verification_token' column")
            else:
                print("✓ 'verification_token' column already exists")

            # Add verification_token_expiry column if it doesn't exist
            if 'verification_token_expiry' not in existing_columns:
                print("Adding 'verification_token_expiry' column...")
                connection.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN verification_token_expiry TIMESTAMP
                """))
                connection.commit()
                print("✓ Added 'verification_token_expiry' column")
            else:
                print("✓ 'verification_token_expiry' column already exists")

            # Set existing users as verified (optional - you can modify this behavior)
            print("\nUpdating existing users...")
            result = connection.execute(text("""
                UPDATE users
                SET is_verified = TRUE
                WHERE is_verified IS NULL OR is_verified = FALSE
            """))
            connection.commit()
            print(f"✓ Marked {result.rowcount} existing users as verified")

            print("\n✓ Migration completed successfully!")
            print("\nNext steps:")
            print("1. Update your .env file with SMTP credentials")
            print("2. Restart your backend server")
            print("3. Test the email verification flow")

        except Exception as e:
            print(f"✗ Error during migration: {str(e)}")
            connection.rollback()
            raise

if __name__ == "__main__":
    migrate()
