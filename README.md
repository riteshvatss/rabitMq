The Todo API publishes messages to RabbitMQ, and the Email Consumer consumes them and sends the email using Nodemailer.
This project is intended for learning event-driven backend architecture and is not production-ready.

## Setup

### 1. Install dependencies

```bash
bun add express amqplib nodemailer dotenv
```

For TypeScript:

```bash
bun add -d @types/express @types/amqplib @types/nodemailer
```

### 2. Start RabbitMQ

Make sure Docker is running, then:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

RabbitMQ Dashboard:

```text
http://localhost:15672
```

Default login:

```text
Username: guest
Password: guest
```

### 3. Configure Email

Create `.env` in the email service:

```env
user=your-ethereal-email
pass=your-ethereal-password
```

Get test SMTP credentials from [Ethereal](https://ethereal.email/).

### 4. Run the services

**Todo API:**

```bash
bun index.ts
```

**Email Consumer:**

```bash
bun index.ts
```

The Todo API publishes messages to RabbitMQ, and the Email Consumer consumes them and sends the email using Nodemailer.
