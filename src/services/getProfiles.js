const getTherapistProfileFromUserId = async (userId) => {

  return prisma.therapistProfile.findUnique({
    where: { userId }
  });
};

const getPatientProfileFromUserId = async (userId) => {

  return prisma.patientProfile.findUnique({
    where: { userId }
  });
};

module.exports = {
  getTherapistProfileFromUserId,
  getPatientProfileFromUserId
};