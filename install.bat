@echo off
echo Installing dependencies...

echo Installing server dependencies...
npm install

echo Installing client dependencies...
cd client
npm install
cd ..

echo Installation complete!
echo.
echo To run the application:
echo npm run dev
pause