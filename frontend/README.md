CtrlCook 🍳
CtrlCook is a full-stack web application designed to support recipe exploration, customization, and personal culinary curation. The system enables users to browse externally sourced recipes, transform them through ingredient and instruction modifications, and archive customized versions for future use.

Application Objectives
Facilitate access to diverse recipes sourced via an external API

Provide an interface allowing personalized modification of recipe data

Support database-backed storage of user-curated recipes

Deliver a functional and intuitive user experience across devices

Use Cases
CtrlCook addresses the needs of:
Individuals seeking to adapt recipes to dietary restrictions or personal preferences

Users wishing to maintain a structured and persistent recipe archive

Cooking enthusiasts who experiment with substitutions and alterations

Students and developers researching full-stack application architecture and API integration

Technology Stack
Frontend: React, Redux
Backend: Node.js (Express)
Database: MongoDB
External API: Spoonacular Recipe API

System Architecture (High-Level Overview)
The frontend communicates user requests to the backend.

For recipe retrieval, the backend interacts with the Spoonacular API.

When saving customized recipes, the backend writes data to MongoDB.

The database persists user-generated recipe objects, enabling retrieval in the “My Cookbook” view.

Changes in application state are managed via Redux to ensure synchronous UI behavior across components.

Developer Learning Outcomes
During the development of CtrlCook, the following competencies were strengthened:
Structuring and deploying a full-stack JavaScript application

Utilizing RESTful APIs for dynamic content retrieval

Implementing persistent storage using MongoDB

Applying state-management patterns via Redux

Designing responsive user interfaces and component-based styling

Potential Future Enhancements
User authentication and profile persistence

Intelligent substitution recommendations using AI models

Social features including recipe sharing and commenting

Automatic grocery list generation

A native mobile implementation
