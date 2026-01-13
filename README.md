# Sudanese Restaurant Dashboard

A comprehensive restaurant management system built specifically for Sudanese restaurants, featuring real-time order management, menu administration, and modern Arabic-friendly interface.

## 🌟 Features

### 🔐 Authentication System
- Firebase Authentication for secure login/registration
- Restaurant owner account management
- Protected routes and user sessions

### 📊 Dashboard
- Modern purple/white themed interface
- Real-time connection status indicator
- Quick action buttons for common tasks
- Restaurant profile overview

### 🍽️ Menu Management
- Complete CRUD operations for meals
- Cloudinary integration for image uploads
- Bulk price update functionality
- Availability toggle for meals
- Optimized image delivery

### 📋 Orders Management
- Real-time order notifications with Socket.io
- Order status tracking (Pending → Accepted → Preparing → Ready)
- Audio and visual notifications for new orders
- Filtered order views by status
- Order details with customer information

### 🏪 Restaurant Profile
- Restaurant information management
- Logo upload with Cloudinary
- Payment method configuration (Cash/Bank/Both)
- Location and contact details

### 📈 Sudan-Specific Features
- **Bulk Price Updates**: Handle inflation by updating all prices with percentage
- **Connectivity Handling**: Offline/online status monitoring
- **Multiple Payment Methods**: Support for cash and bank payments
- **Arabic RTL Interface**: Right-to-left text support

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase SDK** - Authentication and Firestore integration
- **Socket.io Client** - Real-time communication
- **Cloudinary** - Image upload and optimization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **Firebase Admin** - Server-side Firebase integration
- **Cloudinary** - Image storage and processing
- **Multer** - File upload handling

### Database & Services
- **Firebase Firestore** - NoSQL document database
- **Firebase Authentication** - User management
- **Cloudinary** - Image storage and CDN

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omer-fixz/resturant.git
   cd resturant
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` files in both client and server directories:
   
   **Client (.env)**
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```
   
   **Server (.env)**
   ```env
   PORT=5000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Add your domain to authorized domains

5. **Cloudinary Setup**
   - Create a Cloudinary account
   - Get your cloud name, API key, and API secret
   - Configure upload presets if needed

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Usage

### For Restaurant Owners

1. **Registration**: Create an account with restaurant details
2. **Menu Setup**: Add meals with images, prices, and descriptions
3. **Order Management**: Monitor and update order statuses in real-time
4. **Price Updates**: Use bulk update feature for inflation adjustments
5. **Profile Management**: Update restaurant information and payment methods

### Key Workflows

- **Adding a Meal**: Navigate to Menu Management → Add New Meal → Fill details and upload image
- **Processing Orders**: Orders appear automatically → Accept → Mark as Preparing → Mark as Ready
- **Bulk Price Update**: Use the quick action button to adjust all prices by percentage
- **Profile Updates**: Access restaurant profile to update information and logo

## 🏗️ Project Structure

```
resturant/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and service functions
│   │   └── firebase.js    # Firebase configuration
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   └── package.json
├── .kiro/                # Kiro specifications
│   └── specs/
└── README.md
```

## 🔧 API Endpoints

### Menu Management
- `GET /api/menu/:restaurantId` - Get restaurant menu
- `POST /api/menu/meal` - Add new meal
- `PUT /api/menu/meal/:id` - Update meal
- `DELETE /api/menu/meal/:id` - Delete meal
- `PATCH /api/menu/meal/:id/toggle` - Toggle meal availability
- `POST /api/menu/bulk-price-update` - Bulk update prices

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:restaurantId` - Get restaurant orders
- `PUT /api/orders/:id/status` - Update order status

### Restaurant Profile
- `GET /api/restaurant/profile/:userId` - Get restaurant profile
- `PUT /api/restaurant/profile/:id` - Update restaurant profile

## 🌐 Real-time Features

The application uses Socket.io for real-time communication:

- **New Order Notifications**: Instant alerts when customers place orders
- **Order Status Updates**: Real-time status changes across all connected clients
- **Connection Status**: Live monitoring of server connectivity

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#6B21A8, #7C3AED, #8B5CF6)
- **Secondary**: White (#FFFFFF)
- **Accent**: Gray shades for text and backgrounds
- **Status Colors**: Green (available), Red (unavailable), Yellow (pending), Blue (accepted)

### Typography
- **Arabic Support**: RTL text direction
- **Font Weights**: Regular (400), Semibold (600), Bold (700)
- **Responsive**: Scales appropriately across devices

## 🔒 Security Features

- Firebase Authentication for secure user management
- Environment variables for sensitive configuration
- Input validation and sanitization
- Protected API endpoints
- Secure file upload handling

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Set environment variables
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for authentication and database services
- Cloudinary for image storage and optimization
- Socket.io for real-time communication
- Tailwind CSS for the design system
- React community for excellent documentation and tools

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [Your contact information]

---

**Built with ❤️ for Sudanese restaurants**