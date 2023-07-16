# React Image Recognition App

This is a web application built with React that allows users to register, sign in, and submit image URLs for analysis. The application utilizes a server-side backend application using Express.js and a PostgreSQL database. It handles user registration, authentication, profile management, and image recognition using the Clarifai face-detection AI model.

The backend repository for the server-side application can be found at [face-recognition-api](https://github.com/apvett09/face-recognition-api) on GitHub. The backend is hosted on Heroku, and the database is also hosted on Heroku.


## Features

- User Registration: Users can create an account by providing their name, email, and password.
- User Sign In: Registered users can sign in using their email and password to access the app.
- Image Submission: Once signed in, users can submit image URLs to be analyzed by the application.
- Image Recognition: The application utilizes the Clarifai face-detection AI model to recognize faces in the submitted images.
- Profile Management: Users can view and update their profile information, including name, email, and password.

## Technologies Used

- React: A JavaScript library for building user interfaces.
- Express.js: A minimal and flexible Node.js web application framework.
- PostgreSQL: A powerful open-source relational database management system.
- Clarifai: A machine learning platform that provides AI models for image and video recognition.
- Heroku: A cloud platform for hosting applications and databases.

## Prerequisites

This is just a project but if like the frontend feel free to clone/fork. If you want to recreate the entire application checkout the backend code mentioned above. 

Before running the application, ensure that the following dependencies are installed:

- Node.js: [Download and install Node.js](https://nodejs.org) if it is not already installed.
- PostgreSQL: Install locally or host one on Heroku.
- Clarifai API Key: Sign up for a Clarifai account and obtain an API key.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- The application utilizes the [Clarifai](https://www.clarifai.com/) face-detection AI model.
