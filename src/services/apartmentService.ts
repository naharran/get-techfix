import Apartment from '../models/Apartment'
import User, { IUser } from '../models/User'
import Location from '../models/Location'
import { geocodeAddress } from '../utils/geocoding'
import { IApartment } from '../models/Apartment'
import { UserType } from '../types'
class ApartmentService {
  async createApartment (
    name: string,
    address: string,
    userId: string
  ): Promise<IApartment> {
    const coordinates = await geocodeAddress(address)
    const newApartment = new Apartment({
      name,
      address,
      residents: [userId],
      coordinates
    })

    await newApartment.save()
    await User.findByIdAndUpdate(userId, {
      'residentData.apartmentId': newApartment._id
    })

    return newApartment
  }

  async getApartments (queryParams: any): Promise<IApartment[]> {
    let query: any = {}
    if (queryParams.residentName || queryParams.residentEmail) {
      let userMatch: any = {}
      if (queryParams.residentName) {
        const nameRegex = new RegExp(queryParams.residentName, 'i');
        userMatch['$or'] = [{ firstName: nameRegex }, { lastName: nameRegex }];
      }
      if (queryParams.residentEmail)
        userMatch['email'] = new RegExp(queryParams.residentEmail, 'i')

      const users = await User.find(userMatch)
      const userIds = users.map(user => user._id)
      query['residents'] = { $in: userIds }
    }

    if (queryParams.address)
      query['address'] = new RegExp(queryParams.address, 'i')
    if (queryParams.apartmentName)
      query['name'] = new RegExp(queryParams.apartmentName, 'i')

    return Apartment.find(query)
  }

  async getApartmentById (apartmentId: string): Promise<IApartment | null> {
    return Apartment.findById(apartmentId)
  }

  async findPotentialFixers (
    apartmentId: string,
    issueType?: string
  ): Promise<IUser[]> {
    const apartment = await Apartment.findById(apartmentId)
    if (!apartment) {
      throw new Error('Apartment not found')
    }

    const radius = 5000 //  5km radius
    const relevantLocationIds = await this.findRelevantLocations(
      apartment.coordinates,
      radius
    )

    let fixerQuery = { 'fixerData.locations': { $in: relevantLocationIds } }
    if (issueType) {
      fixerQuery['fixerData.services'] = issueType
    }

    return User.find(fixerQuery).where('userType').equals(UserType.Fixer)
  }

  private async findRelevantLocations (
    apartmentCoordinates: { lon: number; lat: number },
    radius: number
  ): Promise<string[]> {
    const relevantLocations = await Location.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [apartmentCoordinates.lon, apartmentCoordinates.lat]
          },
          $maxDistance: radius
        }
      }
    })

    return relevantLocations.map(loc => loc._id.toString())
  }
}

export default new ApartmentService()
