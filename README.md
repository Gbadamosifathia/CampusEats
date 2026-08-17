# 🍔 CampusEats 

A campus food-ordering backend built with **Django REST Framework**, allowing students to order from campus vendors and pay online through **Paystack**.

## Features

* JWT authentication
* Vendor and menu management
* Order and order-item management
* Paystack payment integration
* Ownership-based permissions

## Tech Stack

* Python
* Django
* Django REST Framework
* MySQL
* JWT
* Paystack API

## Getting Started

### Install dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-django-secret-key
DB_NAME=campuseats_db
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306
PAYSTACK_SECRET_KEY=sk_test_your_key
```

> ⚠️ Never commit your real `.env` file or secret keys to GitHub.

### Run migrations

```bash
python manage.py migrate
```

### Start the server

```bash
python manage.py runserver
```

## Status

🚧 In active development.

Built as a learning project to practice **Django REST APIs, authentication, permissions, databases, and payment integration**.
