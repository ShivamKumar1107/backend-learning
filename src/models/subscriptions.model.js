import mongoose, {Schema, model} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId, // one who is being subscribed to
        ref: "User",
        required: true
    },
    isSubscribed: {
        type: Boolean, // true if subscriber is subscribed to channel
        default: false
    }
}, 
{timestamps: true});

export const Subscription = model("Subscription", subscriptionSchema);