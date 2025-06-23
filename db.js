import mongoose from "mongoose";

const dbconnect = async () => {
  try {
    const connectioninstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `mongodb has connected on the db host : ${connectioninstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
    z;
  }
};

export default dbconnect;
