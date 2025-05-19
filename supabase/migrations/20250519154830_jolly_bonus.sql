/*
  # Initial Schema Setup for Blood Bank Application

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - created_at (timestamp)
    - donors
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - blood_type (text)
      - last_donation (timestamp)
      - created_at (timestamp)
    - hospitals
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - name (text)
      - address (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('donor', 'hospital', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  blood_type text NOT NULL,
  last_donation timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS h