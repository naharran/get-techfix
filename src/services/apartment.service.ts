import User from "../models/User";
import Location from "../models/Location"
import { UserType } from "../types";

async function findRelevantLocations(apartmentCoordinates, radius) {
    try {
        const relevantLocations = await Location.find({
            coordinates: { 
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [apartmentCoordinates.lon, apartmentCoordinates.lat]
                    },
                    $maxDistance: radius
                }
            }
        });

        return relevantLocations.map(loc => loc._id);
    } catch (error) {
        console.error("Error in findRelevantLocations:", error);
        throw error;
    }
}

export async function findPotentialFixers(apartmentCoordinates, issueType) {
    const radius = 5000; // Example: 5km radius
    const relevantLocationIds = await findRelevantLocations(apartmentCoordinates, radius);
    let fixerQuery = { 
        'fixerData.locations': { $in: relevantLocationIds }
    };

    if (issueType) {
        // Assuming issueType is stored as an ID in 'services' array of fixerData
        fixerQuery['fixerData.services'] = issueType;
    }

    const potentialFixers = await User.find(fixerQuery).where('userType').equals(UserType.Fixer);
    return potentialFixers;
}