import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URL);

    console.log(
      "Database connected: " + dbConnection.connection.db.databaseName
    );
  } catch (error) {
    console.log("Database Error: " + error);
  }
};

export default dbConnection;
