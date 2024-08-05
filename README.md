# Pantry Management System

## Overview

The **Pantry Management System** is a web application built using React, Next.js, and Firebase. It allows users to manage their pantry by adding, editing, deleting products, and generating recipe suggestions based on the products in their pantry.

## Features

- **User Authentication:** Users can log in and manage their pantry securely.
- **Product Management:** Add, edit, and delete pantry products with details such as name, quantity, category, and price.
- **Search Functionality:** Search for products easily using the search bar.
- **Recipe Suggestions:** Generate recipe ideas using AI based on the products in the pantry.
- **Responsive Design:** The application is designed to be user-friendly and responsive on different devices.

## Technologies Used

- **React:** For building the user interface.
- **Next.js:** For server-side rendering and routing.
- **Firebase:** For authentication and Firestore database management.
- **Material-UI (MUI):** For UI components and styling.
- **Generative AI Model:** For generating recipe suggestions.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/pantry-management-system.git

    Navigate to the Project Directory

    bash
   ```

cd pantry-management-system

Install Dependencies

bash

npm install

# or

yarn install

Set Up Firebase

    Create a Firebase project and set up Firestore and Authentication.
    Add your Firebase configuration to the project:
    Replace the Firebase configuration in utils/firebase.ts with your Firebase project's credentials.

Run the Application

bash

    npm run dev
    # or
    yarn dev

    Open your browser and go to http://localhost:3000 to see the application in action.

Usage

    Authentication
        Users can log in using their credentials. If not logged in, they will be redirected to the login page.

    Managing Products
        Use the "Add Product" button to add a new product to your pantry.
        Edit or delete existing products using the corresponding icons.

    Searching Products
        Enter the product name in the search bar to filter the products list.

    Generating Recipes
        Click the "Get Recipe Suggestion" button to generate a recipe based on the products in your pantry.

File Structure

    app/: Contains the Next.js pages.
    components/: Contains reusable React components.
    utils/: Contains utility functions and Firebase configuration.
    public/: Contains static assets like images and icons.
 
