const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.sessionPayment.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.clientPackage.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.package.deleteMany({});
  await prisma.client.deleteMany({});
  console.log('🗑️  Cleared existing data');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ojasclinic.com' },
    update: {},
    create: {
      email: 'admin@ojasclinic.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '9876543210'
    }
  });
  console.log('✅ Created admin user:', admin.email);

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@ojasclinic.com' },
    update: {},
    create: {
      email: 'doctor@ojasclinic.com',
      password: hashedPassword,
      name: 'Dr. Sharma',
      role: 'DOCTOR',
      phone: '9876543211'
    }
  });
  console.log('✅ Created doctor user:', doctor.email);

  const staff = await prisma.user.upsert({
    where: { email: 'staff@ojasclinic.com' },
    update: {},
    create: {
      email: 'staff@ojasclinic.com',
      password: hashedPassword,
      name: 'Staff Member',
      role: 'STAFF',
      phone: '9876543212'
    }
  });
  console.log('✅ Created staff user:', staff.email);

  const packages = await Promise.all([
    prisma.package.upsert({
      where: { id: 'pkg-1' },
      update: {},
      create: {
        id: 'pkg-1',
        name: 'Skin Rejuvenation Package',
        category: 'Skin Glow',
        description: 'Complete skin rejuvenation with 3 sessions',
        numberOfSessions: 3,
        actualPrice: 5999,
        discountedPrice: 3999,
        validityMonths: 3
      }
    }),
    prisma.package.upsert({
      where: { id: 'pkg-2' },
      update: {},
      create: {
        id: 'pkg-2',
        name: 'Acne Treatment Package',
        category: 'Acne',
        description: 'Complete acne treatment with 6 sessions',
        numberOfSessions: 6,
        actualPrice: 8999,
        discountedPrice: 6999,
        validityMonths: 4
      }
    }),
    prisma.package.upsert({
      where: { id: 'pkg-3' },
      update: {},
      create: {
        id: 'pkg-3',
        name: 'Laser Hair Removal - Full Arms',
        category: 'Laser Hair Removal',
        description: 'Full arms laser hair removal - 8 sessions',
        numberOfSessions: 8,
        actualPrice: 12999,
        discountedPrice: 9999,
        validityMonths: 6
      }
    })
  ]);
  console.log('✅ Created sample packages:', packages.length);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Vitamin C Serum',
        category: 'Serums',
        quantity: 50,
        minStockLevel: 10,
        unitPrice: 899
      }
    }),
    prisma.product.create({
      data: {
        name: 'Sunscreen SPF 50+',
        category: 'Sunscreen',
        quantity: 100,
        minStockLevel: 20,
        unitPrice: 650
      }
    }),
    prisma.product.create({
      data: {
        name: 'Acne Peel Solution',
        category: 'Peels',
        quantity: 30,
        minStockLevel: 5,
        unitPrice: 1500
      }
    })
  ]);
  console.log('✅ Created sample products:', products.length);

  // Create sample clients with diverse scenarios for auto-status calculation
  const now = new Date();
  const clients = await Promise.all([
    // New client, no sessions yet - Will auto-calculate to PENDING
    prisma.client.upsert({
      where: { clientId: 'CL0001' },
      update: {},
      create: {
        clientId: 'CL0001',
        fullName: 'Priya Sharma',
        gender: 'FEMALE',
        dateOfBirth: new Date('1995-03-15'),
        phone: '9876543213',
        whatsapp: '9876543213',
        email: 'priya.sharma@gmail.com',
        address: '123 MG Road, Mumbai, Maharashtra',
        skinType: 'COMBINATION',
        skinConcerns: 'Acne, Dark spots',
        totalSessionsCompleted: 0,
        missedAppointments: 0
      }
    }),
    // Recent session (10 days ago), upcoming appointment - Will auto-calculate to ACTIVE
    prisma.client.upsert({
      where: { clientId: 'CL0002' },
      update: {},
      create: {
        clientId: 'CL0002',
        fullName: 'Rahul Verma',
        gender: 'MALE',
        dateOfBirth: new Date('1988-07-22'),
        phone: '9876543214',
        whatsapp: '9876543214',
        email: 'rahul.verma@yahoo.com',
        address: '456 Park Street, Delhi',
        skinType: 'OILY',
        skinConcerns: 'Acne scars, Oily skin',
        lastVisitDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        nextAppointmentDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        totalSessionsCompleted: 3,
        missedAppointments: 0
      }
    }),
    // Recent visit (20 days ago), no upcoming appointment - Will auto-calculate to ACTIVE
    prisma.client.upsert({
      where: { clientId: 'CL0003' },
      update: {},
      create: {
        clientId: 'CL0003',
        fullName: 'Anjali Patel',
        gender: 'FEMALE',
        dateOfBirth: new Date('1992-11-08'),
        phone: '9876543215',
        whatsapp: '9876543215',
        email: 'anjali.patel@outlook.com',
        address: '789 Link Road, Ahmedabad, Gujarat',
        skinType: 'DRY',
        skinConcerns: 'Pigmentation, Dull skin',
        lastVisitDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        totalSessionsCompleted: 2,
        missedAppointments: 0
      }
    }),
    // Treatment finished - Will have treatmentCompleted=true in last session, auto-calculates to COMPLETED
    prisma.client.upsert({
      where: { clientId: 'CL0004' },
      update: {},
      create: {
        clientId: 'CL0004',
        fullName: 'Vikram Singh',
        gender: 'MALE',
        dateOfBirth: new Date('1985-05-30'),
        phone: '9876543216',
        whatsapp: '9876543216',
        email: 'vikram.singh@gmail.com',
        address: '321 Civil Lines, Jaipur, Rajasthan',
        skinType: 'COMBINATION',
        skinConcerns: 'Anti-aging, Fine lines',
        lastVisitDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        totalSessionsCompleted: 8,
        missedAppointments: 0
      }
    }),
    // Haven't visited in 50 days, 1 missed appointment - Will auto-calculate to INACTIVE
    prisma.client.upsert({
      where: { clientId: 'CL0005' },
      update: {},
      create: {
        clientId: 'CL0005',
        fullName: 'Sneha Reddy',
        gender: 'FEMALE',
        dateOfBirth: new Date('1998-09-12'),
        phone: '9876543217',
        whatsapp: '9876543217',
        email: 'sneha.reddy@gmail.com',
        address: '567 Banjara Hills, Hyderabad, Telangana',
        skinType: 'SENSITIVE',
        skinConcerns: 'Redness, Sensitive skin',
        lastVisitDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
        totalSessionsCompleted: 2,
        missedAppointments: 1
      }
    }),
    // Haven't visited in 70 days, 2 missed appointments - Will auto-calculate to GHOSTED
    prisma.client.upsert({
      where: { clientId: 'CL0006' },
      update: {},
      create: {
        clientId: 'CL0006',
        fullName: 'Arjun Mehta',
        gender: 'MALE',
        dateOfBirth: new Date('1990-12-25'),
        phone: '9876543218',
        email: 'arjun.mehta@hotmail.com',
        address: '890 Residency Road, Bangalore, Karnataka',
        skinType: 'OILY',
        skinConcerns: 'Acne, Blackheads',
        lastVisitDate: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
        totalSessionsCompleted: 1,
        missedAppointments: 2
      }
    }),
    // Overdue appointment (was 3 days ago, didn't show up) - Will auto-calculate to ACTIVE
    prisma.client.upsert({
      where: { clientId: 'CL0007' },
      update: {},
      create: {
        clientId: 'CL0007',
        fullName: 'Kavya Nair',
        gender: 'FEMALE',
        dateOfBirth: new Date('1994-04-18'),
        phone: '9876543219',
        email: 'kavya.nair@gmail.com',
        address: '234 Marine Drive, Kochi, Kerala',
        skinType: 'DRY',
        skinConcerns: 'Dry skin, Wrinkles',
        lastVisitDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        nextAppointmentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (overdue!)
        totalSessionsCompleted: 4,
        missedAppointments: 1
      }
    }),
    // Manually cancelled - Set to CANCELLED (won't auto-update)
    prisma.client.upsert({
      where: { clientId: 'CL0008' },
      update: {},
      create: {
        clientId: 'CL0008',
        fullName: 'Rohan Kapoor',
        gender: 'MALE',
        dateOfBirth: new Date('1987-08-05'),
        phone: '9876543220',
        email: 'rohan.kapoor@yahoo.com',
        address: '678 Sector 17, Chandigarh',
        skinType: 'COMBINATION',
        skinConcerns: 'Uneven skin tone',
        status: 'CANCELLED', // Manually set, won't be auto-updated
        lastVisitDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        totalSessionsCompleted: 2,
        missedAppointments: 0
      }
    })
  ]);
  console.log('✅ Created sample clients:', clients.length);
  
  // Create comprehensive sessions with full details - mix of past and upcoming
  const sessions = await Promise.all([
    // Priya (CL0001) - Session 1 (Past - 60 days ago) - COMPLETED & PAID
    prisma.session.create({
      data: {
        clientId: clients[0].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        category: 'Pigmentation',
        doctorId: doctor.id,
        beforeCondition: 'Dark spots on cheeks and forehead. Uneven skin tone. Patient concerned about hyperpigmentation from sun exposure.',
        acneSeverity: null,
        scarType: null,
        pigmentationLevel: 'HIGH',
        glowDullnessScale: 3,
        hairDensity: null,
        textureRoughness: 6,
        poreVisibility: 5,
        hasInflammation: false,
        treatmentsPerformed: ['Chemical Peel - Glycolic Acid 30%', 'Pigmentation analysis', 'Skin tone mapping'],
        productsUsed: ['Glycolic Acid Peel', 'Sunscreen SPF 50+', 'Vitamin C Serum'],
        afterNotes: 'Mild redness observed post-treatment. Client advised to avoid sun exposure for 48 hours.',
        immediateOutcome: 'Slight tingling sensation, skin appears slightly red',
        sideEffects: 'Mild redness and sensitivity',
        nextSessionDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        expectedResultTime: '2-3 weeks',
        postCareInstructions: 'Apply sunscreen every 2 hours. Avoid direct sunlight. Use gentle cleanser. Apply vitamin C serum daily.',
        doctorSuggestions: 'Continue with pigmentation treatment. Schedule next session in 3 weeks.',
        prescribedMedicines: 'Vitamin C serum (morning), Hydroquinone 2% cream (night)',
        treatmentCompleted: true,
        paymentAmount: 3500,
        paymentStatus: 'PAID'
      }
    }),

    // Priya (CL0001) - Session 2 (Past - 40 days ago) - COMPLETED & PENDING PAYMENT
    prisma.session.create({
      data: {
        clientId: clients[0].id,
        sessionNumber: '2',
        date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        category: 'Pigmentation',
        doctorId: doctor.id,
        beforeCondition: 'Improvement noticed from last session. Dark spots have lightened by approximately 20%. Skin texture improved.',
        pigmentationLevel: 'MEDIUM',
        glowDullnessScale: 5,
        textureRoughness: 4,
        poreVisibility: 4,
        hasInflammation: false,
        treatmentsPerformed: ['Chemical Peel - Glycolic Acid 40%', 'LED Light Therapy', 'Hydrating Mask'],
        productsUsed: ['Glycolic Acid Peel', 'Hyaluronic Acid Serum', 'Sunscreen SPF 50+'],
        afterNotes: 'Excellent response to treatment. Skin tone becoming more even. Client very satisfied with results.',
        immediateOutcome: 'Skin appears brighter and more even-toned',
        sideEffects: 'No significant side effects',
        nextSessionDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        expectedResultTime: '2 weeks',
        postCareInstructions: 'Continue sunscreen application. Use hydrating serum twice daily. Avoid harsh exfoliants.',
        doctorSuggestions: 'One more session should give optimal results. Maintain skincare routine.',
        prescribedMedicines: 'Vitamin C serum (morning), Niacinamide 5% serum (night)',
        treatmentCompleted: true,
        paymentAmount: 3500,
        paymentStatus: 'PENDING'
      }
    }),

    // Priya (CL0001) - Session 3 (Past - 20 days ago) - COMPLETED & PARTIAL PAYMENT
    prisma.session.create({
      data: {
        clientId: clients[0].id,
        sessionNumber: '3',
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        category: 'Pigmentation',
        doctorId: doctor.id,
        beforeCondition: 'Significant improvement. Dark spots reduced by 60%. Skin tone much more even and glowing.',
        pigmentationLevel: 'LOW',
        glowDullnessScale: 8,
        textureRoughness: 2,
        poreVisibility: 3,
        hasInflammation: false,
        treatmentsPerformed: ['Maintenance Chemical Peel', 'Vitamin C Infusion', 'Brightening Mask'],
        productsUsed: ['Lactic Acid Peel', 'Vitamin C Serum', 'Brightening Cream'],
        afterNotes: 'Treatment highly successful. Client achieved desired results. Maintenance plan discussed.',
        immediateOutcome: 'Radiant, even-toned skin. Client extremely happy',
        sideEffects: 'None',
        nextSessionDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        expectedResultTime: 'Results maintained',
        postCareInstructions: 'Maintain daily sunscreen. Continue vitamin C serum. Monthly maintenance recommended.',
        doctorSuggestions: 'Treatment complete. Schedule maintenance session in 2 months.',
        prescribedMedicines: 'Vitamin C serum (daily), Sunscreen SPF 50+ (daily)',
        treatmentCompleted: true,
        paymentAmount: 3500,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Card payment successful'
      }
    }),

    // Priya (CL0001) - Session 4 (Upcoming - 30 days from now)
    prisma.session.create({
      data: {
        clientId: clients[0].id,
        sessionNumber: '4',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        category: 'Pigmentation',
        doctorId: doctor.id,
        beforeCondition: '',
        treatmentsPerformed: [],
        productsUsed: [],
        afterNotes: '',
        treatmentCompleted: false,
        paymentStatus: 'UPCOMING'
      }
    }),

    // Rahul (CL0002) - Session 1 (Past - 50 days ago)
    prisma.session.create({
      data: {
        clientId: clients[1].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        category: 'Acne Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Moderate to severe acne on face. Multiple active breakouts on forehead, cheeks, and chin. Comedones and pustules present. Oily skin with enlarged pores.',
        acneSeverity: 'SEVERE',
        scarType: 'ICE_PICK',
        pigmentationLevel: 'LOW',
        glowDullnessScale: 3,
        textureRoughness: 8,
        poreVisibility: 8,
        hasInflammation: true,
        treatmentsPerformed: ['Deep Cleansing', 'Salicylic Acid Peel 20%', 'Extraction (minimal)', 'LED Blue Light Therapy'],
        productsUsed: ['Salicylic Acid Peel', 'Acne Treatment Serum', 'Oil-free Moisturizer'],
        afterNotes: 'Initial deep cleansing performed. Client advised on proper skincare routine. Some extractions done carefully.',
        immediateOutcome: 'Skin appears cleaner. Redness from extractions',
        sideEffects: 'Mild irritation and redness post-extraction',
        nextSessionDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expectedResultTime: '4-6 weeks for visible improvement',
        postCareInstructions: 'Cleanse face twice daily with salicylic acid cleanser. Apply benzoyl peroxide gel on active acne. Avoid touching face. No picking.',
        doctorSuggestions: 'Regular sessions needed. Diet modification recommended - reduce dairy and sugar intake.',
        prescribedMedicines: 'Benzoyl Peroxide 2.5% gel (spot treatment), Adapalene 0.1% gel (night - entire face)',
        treatmentCompleted: false,
        paymentAmount: 4000,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Initial consultation and treatment'
      }
    }),

    // Rahul (CL0002) - Session 2 (Past - 30 days ago)
    prisma.session.create({
      data: {
        clientId: clients[1].id,
        sessionNumber: '2',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        category: 'Acne Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Slight improvement noted. Active breakouts reduced by 25%. Less inflammation. Still experiencing new acne formation but at reduced rate.',
        acneSeverity: 'MODERATE',
        scarType: 'ICE_PICK',
        glowDullnessScale: 4,
        textureRoughness: 7,
        poreVisibility: 7,
        hasInflammation: true,
        treatmentsPerformed: ['Salicylic Acid Peel 30%', 'Gentle Extraction', 'Anti-bacterial Treatment', 'LED Therapy'],
        productsUsed: ['Salicylic Acid Peel', 'Niacinamide Serum', 'Tea Tree Oil Treatment'],
        afterNotes: 'Progress is good. Client following skincare routine properly. Inflammation reduced.',
        immediateOutcome: 'Skin texture improving. Less active acne visible',
        sideEffects: 'Minimal dryness',
        nextSessionDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        expectedResultTime: '3-4 weeks',
        postCareInstructions: 'Continue prescribed routine. Add hydrating serum to prevent dryness. Maintain consistent application.',
        doctorSuggestions: 'Good progress. Continue treatment plan. Consider adding microneedling after acne is controlled.',
        prescribedMedicines: 'Benzoyl Peroxide 5% gel (spot), Niacinamide 10% serum (daily), Adapalene 0.1% gel (night)',
        treatmentCompleted: false,
        paymentAmount: 3800,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Follow-up session payment'
      }
    }),

    // Rahul (CL0002) - Session 3 (Past - 10 days ago)
    prisma.session.create({
      data: {
        clientId: clients[1].id,
        sessionNumber: '3',
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        category: 'Acne Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Significant improvement. Active acne reduced by 60%. Skin texture much better. Some post-acne marks remain. No new severe breakouts.',
        acneSeverity: 'MILD',
        scarType: 'ICE_PICK',
        glowDullnessScale: 6,
        textureRoughness: 5,
        poreVisibility: 6,
        hasInflammation: false,
        treatmentsPerformed: ['Maintenance Salicylic Peel', 'Spot Treatment', 'Pore Minimizing Treatment'],
        productsUsed: ['Salicylic Acid Peel', 'Niacinamide Serum', 'Pore Minimizer'],
        afterNotes: 'Excellent response to treatment. Active acne mostly resolved. Now focus on scars and marks.',
        immediateOutcome: 'Clear, healthier-looking skin. Client very satisfied',
        sideEffects: 'None',
        nextSessionDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        expectedResultTime: 'Maintenance phase',
        postCareInstructions: 'Continue routine. Focus on preventing new breakouts. Start using sunscreen daily.',
        doctorSuggestions: 'Ready to start scar treatment. Consider microneedling or laser for ice-pick scars.',
        prescribedMedicines: 'Adapalene 0.1% gel (maintenance), Niacinamide 10% serum (daily), Sunscreen SPF 50+',
        treatmentCompleted: false,
        paymentAmount: 3500,
        paymentMethod: 'CARD',
        paymentStatus: 'PARTIAL',
        paymentNotes: 'Paid ₹2000, remaining ₹1500 pending'
      }
    }),

    // Rahul (CL0002) - Session 4 (Upcoming - 15 days from now)
    prisma.session.create({
      data: {
        clientId: clients[1].id,
        sessionNumber: '4',
        date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        category: 'Acne Scar Treatment',
        doctorId: doctor.id,
        beforeCondition: '',
        treatmentsPerformed: [],
        productsUsed: [],
        afterNotes: '',
        treatmentCompleted: false,
        paymentStatus: 'UPCOMING'
      }
    }),

    // Ananya (CL0003) - Session 1 (Past - 35 days ago)
    prisma.session.create({
      data: {
        clientId: clients[2].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        category: 'Skin Glow',
        doctorId: doctor.id,
        beforeCondition: 'Dull, tired-looking skin. Client complains of lack of radiance. Skin appears dry and lacks luminosity. Fine lines starting to appear.',
        acneSeverity: null,
        pigmentationLevel: 'LOW',
        glowDullnessScale: 3,
        textureRoughness: 6,
        poreVisibility: 5,
        hasInflammation: false,
        treatmentsPerformed: ['Hydrating Facial', 'Vitamin C Infusion', 'Oxygen Therapy', 'Glow Boost Treatment'],
        productsUsed: ['Vitamin C Serum', 'Hyaluronic Acid Serum', 'Glow Mask', 'Peptide Cream'],
        afterNotes: 'Immediate glow visible post-treatment. Skin looks hydrated and plump. Client very happy with instant results.',
        immediateOutcome: 'Instant radiance and glow. Skin feels soft and hydrated',
        sideEffects: 'None',
        nextSessionDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        expectedResultTime: 'Immediate glow, long-term with series',
        postCareInstructions: 'Hydrate well - drink 8 glasses water daily. Use vitamin C serum every morning. Apply hyaluronic acid serum.',
        doctorSuggestions: 'Series of 4-5 sessions recommended for lasting results. Consider adding collagen boosting treatments.',
        prescribedMedicines: 'Vitamin C serum (morning), Hyaluronic acid serum (twice daily), Night repair cream',
        treatmentCompleted: false,
        paymentAmount: 4500,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Glow facial package - session 1'
      }
    }),

    // Ananya (CL0003) - Session 2 (Past - 20 days ago)  
    prisma.session.create({
      data: {
        clientId: clients[2].id,
        sessionNumber: '2',
        date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        category: 'Skin Glow',
        doctorId: doctor.id,
        beforeCondition: 'Skin still maintaining glow from last session. Texture improved. Client reports compliments on skin. Fine lines less visible.',
        glowDullnessScale: 6,
        textureRoughness: 4,
        poreVisibility: 4,
        hasInflammation: false,
        treatmentsPerformed: ['Advanced Glow Facial', 'LED Light Therapy', 'Collagen Boosting Treatment', 'Hydrating Mask'],
        productsUsed: ['Vitamin C Serum', 'Collagen Serum', 'Hyaluronic Mask', 'Glow Cream'],
        afterNotes: 'Enhanced radiance. Skin texture significantly improved. Fine lines reduced. Client maintaining home care well.',
        immediateOutcome: 'Luminous, youthful-looking skin. Excellent glow',
        sideEffects: 'None',
        nextSessionDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        expectedResultTime: 'Cumulative improvement',
        postCareInstructions: 'Continue vitamin C serum. Add retinol (0.3%) for anti-aging. Maintain hydration routine.',
        doctorSuggestions: 'Excellent progress. Two more sessions will lock in results. Consider monthly maintenance.',
        prescribedMedicines: 'Vitamin C serum (morning), Retinol 0.3% (night - 3x week), Hyaluronic acid serum (daily)',
        treatmentCompleted: false,
        paymentAmount: 4500,
        paymentMethod: 'CARD',
        paymentStatus: 'OVERDUE',
        paymentNotes: 'Payment overdue - follow up needed'
      }
    }),

    // Ananya (CL0003) - Session 3 (Upcoming - 10 days from now)
    prisma.session.create({
      data: {
        clientId: clients[2].id,
        sessionNumber: '3',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        category: 'Skin Glow',
        doctorId: doctor.id,
        beforeCondition: '',
        treatmentsPerformed: [],
        productsUsed: [],
        afterNotes: '',
        treatmentCompleted: false,
        paymentStatus: 'UPCOMING'
      }
    }),

    // Vikram (CL0004) - Multiple past sessions (treatment completed)
    prisma.session.create({
      data: {
        clientId: clients[3].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        category: 'Laser Hair Removal',
        doctorId: doctor.id,
        beforeCondition: 'Dense hair growth on arms. Client wants permanent hair reduction. Hair is dark and coarse.',
        hairDensity: 'THICK',
        textureRoughness: 3,
        hasInflammation: false,
        treatmentsPerformed: ['Initial Consultation', 'Patch Test', 'First Laser Session - Full Arms'],
        productsUsed: ['Cooling Gel', 'Aloe Vera Gel', 'Sunscreen SPF 50+'],
        afterNotes: 'First laser session completed. Client tolerated well. Mild redness expected.',
        immediateOutcome: 'Redness and slight warmth in treated area',
        sideEffects: 'Mild redness, resolved within 24 hours',
        nextSessionDate: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000),
        expectedResultTime: '6-8 sessions for optimal results',
        postCareInstructions: 'Avoid sun exposure. Apply aloe vera gel. No waxing or plucking. Shaving allowed.',
        doctorSuggestions: 'Regular sessions every 4-6 weeks. Maintain schedule for best results.',
        treatmentCompleted: false,
        paymentAmount: 8000,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      }
    }),

    prisma.session.create({
      data: {
        clientId: clients[3].id,
        sessionNumber: '8',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        category: 'Laser Hair Removal',
        doctorId: doctor.id,
        beforeCondition: 'Excellent hair reduction achieved. Approximately 85-90% hair removed. Remaining hair is fine and sparse.',
        hairDensity: 'THIN',
        hasInflammation: false,
        treatmentsPerformed: ['Final Laser Session', 'Touch-up Treatment'],
        productsUsed: ['Cooling Gel', 'Soothing Cream'],
        afterNotes: 'Treatment series completed successfully. Client achieved desired results. Maintenance recommended annually.',
        immediateOutcome: 'Smooth, hair-free arms. Client extremely satisfied',
        sideEffects: 'None',
        expectedResultTime: 'Results permanent with occasional maintenance',
        postCareInstructions: 'Continue sun protection. Annual maintenance session if needed.',
        doctorSuggestions: 'Treatment complete. Schedule maintenance only if needed after 12 months.',
        treatmentCompleted: true,
        paymentAmount: 7000,
        paymentMethod: 'ONLINE',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Final session - treatment completed'
      }
    }),

    // Sneha (CL0005) - Inactive client with past sessions
    prisma.session.create({
      data: {
        clientId: clients[4].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        category: 'Sensitive Skin Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Extremely sensitive skin. Redness and irritation with most products. Client tried many products without success.',
        acneSeverity: 'MILD',
        textureRoughness: 7,
        hasInflammation: true,
        treatmentsPerformed: ['Gentle Cleansing', 'Barrier Repair Treatment', 'Calming Mask'],
        productsUsed: ['Gentle Cleanser', 'Ceramide Cream', 'Calming Serum'],
        afterNotes: 'Very gentle approach taken. Client responded well to hypoallergenic products.',
        immediateOutcome: 'Skin calmer, less reactive',
        sideEffects: 'None',
        nextSessionDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        postCareInstructions: 'Use only prescribed gentle products. Patch test anything new. Avoid fragrances and harsh ingredients.',
        doctorSuggestions: 'Build skin barrier slowly. Regular gentle treatments needed.',
        prescribedMedicines: 'Ceramide cream (twice daily), Calming serum (as needed)',
        treatmentCompleted: false,
        paymentAmount: 3000,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }
    }),

    prisma.session.create({
      data: {
        clientId: clients[4].id,
        sessionNumber: '2',
        date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        category: 'Sensitive Skin Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Some improvement in sensitivity. Skin slightly less reactive. Client discontinued treatment after this.',
        hasInflammation: false,
        treatmentsPerformed: ['Barrier Strengthening Treatment', 'Hydration Therapy'],
        productsUsed: ['Barrier Cream', 'Hydrating Serum'],
        afterNotes: 'Client did not return for follow-up appointments despite recommendations.',
        immediateOutcome: 'Improved skin barrier',
        sideEffects: 'None',
        doctorSuggestions: 'Continued treatment recommended but client did not schedule next appointment',
        treatmentCompleted: false,
        paymentAmount: 3000,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Last session - client became inactive'
      }
    }),

    // Arjun (CL0006) - Ghosted after one session
    prisma.session.create({
      data: {
        clientId: clients[5].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        category: 'Acne Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Moderate acne on face. Multiple active breakouts. Client seeking treatment for upcoming wedding.',
        acneSeverity: 'MODERATE',
        hasInflammation: true,
        treatmentsPerformed: ['Initial Acne Assessment', 'Deep Cleansing', 'Spot Treatment'],
        productsUsed: ['Salicylic Cleanser', 'Benzoyl Peroxide Gel'],
        afterNotes: 'Initial consultation completed. Treatment plan explained. Client did not return.',
        immediateOutcome: 'Clean skin post-treatment',
        nextSessionDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        doctorSuggestions: 'Regular sessions needed for acne control. Client did not follow up.',
        treatmentCompleted: false,
        paymentAmount: 2500,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Single consultation - no follow-up'
      }
    }),

    // Kavya (CL0007) - Active with overdue appointment
    prisma.session.create({
      data: {
        clientId: clients[6].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        category: 'Anti-Aging Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Fine lines and wrinkles appearing. Skin showing signs of aging. Client wants preventive anti-aging treatment.',
        glowDullnessScale: 4,
        textureRoughness: 6,
        poreVisibility: 5,
        treatmentsPerformed: ['Anti-Aging Facial', 'Retinol Treatment', 'Collagen Induction'],
        productsUsed: ['Retinol Serum', 'Peptide Cream', 'Collagen Mask'],
        afterNotes: 'First anti-aging session completed. Client educated on skincare routine.',
        immediateOutcome: 'Skin appears smoother and more radiant',
        nextSessionDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        postCareInstructions: 'Use retinol as prescribed. Always wear sunscreen. Gentle skincare routine.',
        doctorSuggestions: 'Series of treatments recommended. Consider adding professional peels.',
        treatmentCompleted: false,
        paymentAmount: 5000,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }
    }),

    prisma.session.create({
      data: {
        clientId: clients[6].id,
        sessionNumber: '4',
        date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        category: 'Anti-Aging Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Progressive improvement in fine lines. Skin texture much better. Client maintaining home routine.',
        glowDullnessScale: 7,
        textureRoughness: 4,
        treatmentsPerformed: ['Professional Chemical Peel', 'LED Therapy', 'Hydration Treatment'],
        productsUsed: ['Glycolic Peel', 'Hyaluronic Serum', 'Peptide Cream'],
        afterNotes: 'Good results. Next appointment scheduled but client missed it.',
        immediateOutcome: 'Smoother, younger-looking skin',
        nextSessionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        doctorSuggestions: 'Continue treatment series. Should not have large gaps.',
        treatmentCompleted: false,
        paymentAmount: 5500,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Missed next scheduled appointment'
      }
    }),

    // Rohan (CL0008) - Cancelled treatment
    prisma.session.create({
      data: {
        clientId: clients[7].id,
        sessionNumber: '1',
        date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        category: 'Skin Tone Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Uneven skin tone. Darker patches on face. Client wants even complexion.',
        pigmentationLevel: 'MEDIUM',
        glowDullnessScale: 4,
        treatmentsPerformed: ['Skin Analysis', 'Brightening Treatment', 'Tone Correction'],
        productsUsed: ['Vitamin C Serum', 'Niacinamide Serum', 'Brightening Cream'],
        afterNotes: 'Initial treatment completed. Client seemed satisfied.',
        immediateOutcome: 'Brighter appearance',
        nextSessionDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        doctorSuggestions: 'Series of 5-6 sessions recommended for even tone.',
        treatmentCompleted: false,
        paymentAmount: 3500,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000)
      }
    }),

    prisma.session.create({
      data: {
        clientId: clients[7].id,
        sessionNumber: '2',
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        category: 'Skin Tone Treatment',
        doctorId: doctor.id,
        beforeCondition: 'Slight improvement noted. Client decided to discontinue treatment.',
        pigmentationLevel: 'MEDIUM',
        treatmentsPerformed: ['Follow-up Treatment'],
        productsUsed: ['Brightening Serum'],
        afterNotes: 'Client requested to cancel remaining sessions. Personal reasons cited.',
        immediateOutcome: 'Minimal change visible',
        doctorSuggestions: 'Treatment incomplete. Results require full series.',
        treatmentCompleted: false,
        paymentAmount: 3500,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        paymentDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        paymentNotes: 'Final payment - treatment cancelled by client'
      }
    })
  ]);
  console.log('✅ Created sample sessions:', sessions.length);

  // Create sample session payments
  const sessionPayments = await Promise.all([
    // Priya's first session (index 0) - Full payment
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[0].id,
        amount: 3500,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[0].date.getTime() + 1000),
        notes: 'Full payment received'
      }
    }),
    // Priya's second session (index 1) - Partial payments
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[1].id,
        amount: 1750,
        paymentMethod: 'UPI',
        paymentDate: new Date(sessions[1].date.getTime() + 1000),
        notes: 'Initial payment - 50%'
      }
    }),
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[1].id,
        amount: 1750,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[1].date.getTime() + 5 * 24 * 60 * 60 * 1000),
        notes: 'Remaining payment cleared'
      }
    }),
    // Priya's third session (index 2)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[2].id,
        amount: 3500,
        paymentMethod: 'CARD',
        paymentDate: new Date(sessions[2].date),
        notes: 'Card payment for final pigmentation session'
      }
    }),
    // Priya's fourth session (index 3) - Upcoming, no payment yet
    
    // Rahul's first session (index 4)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[4].id,
        amount: 4000,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[4].date),
        notes: 'First acne treatment session'
      }
    }),
    // Rahul's second session (index 5)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[5].id,
        amount: 4000,
        paymentMethod: 'UPI',
        paymentDate: new Date(sessions[5].date),
        notes: 'Second session payment'
      }
    }),
    // Rahul's third session (index 6)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[6].id,
        amount: 4000,
        paymentMethod: 'CARD',
        paymentDate: new Date(sessions[6].date),
        notes: 'Third session payment'
      }
    }),
    // Rahul's fourth session (index 7) - Upcoming, no payment yet
    
    // Ananya's first session (index 8)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[8].id,
        amount: 4500,
        paymentMethod: 'UPI',
        paymentDate: new Date(sessions[8].date),
        notes: 'Skin glow package - first session'
      }
    }),
    // Ananya's second session (index 9)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[9].id,
        amount: 4500,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[9].date),
        notes: 'Second session payment'
      }
    }),
    // Ananya's third session (index 10) - Upcoming, no payment yet
    
    // Vikram's sessions (index 11, 12) - Already paid in session data
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[11].id,
        amount: 8000,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[11].date),
        notes: 'First laser session - full arms'
      }
    }),
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[12].id,
        amount: 7000,
        paymentMethod: 'ONLINE',
        paymentDate: new Date(sessions[12].date),
        notes: 'Final session - treatment completed'
      }
    }),
    
    // Sneha's sessions (index 13, 14)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[13].id,
        amount: 3000,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[13].date),
        notes: 'First sensitive skin treatment'
      }
    }),
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[14].id,
        amount: 3000,
        paymentMethod: 'UPI',
        paymentDate: new Date(sessions[14].date),
        notes: 'Last session before going inactive'
      }
    }),
    
    // Arjun's session (index 15) - Partial payment only
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[15].id,
        amount: 1500,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[15].date),
        notes: 'Advance payment - client ghosted before paying balance'
      }
    }),
    
    // Kavya's sessions (index 16, 17)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[16].id,
        amount: 5000,
        paymentMethod: 'CARD',
        paymentDate: new Date(sessions[16].date),
        notes: 'First anti-aging session'
      }
    }),
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[17].id,
        amount: 2750,
        paymentMethod: 'UPI',
        paymentDate: new Date(sessions[17].date),
        notes: 'Partial payment - 50%'
      }
    }),
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[17].id,
        amount: 2750,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[17].date.getTime() + 7 * 24 * 60 * 60 * 1000),
        notes: 'Remaining payment'
      }
    }),
    
    // Rohan's sessions (index 18, 19)
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[18].id,
        amount: 3500,
        paymentMethod: 'CASH',
        paymentDate: new Date(sessions[18].date),
        notes: 'First skin tone session'
      }
    }),
    prisma.sessionPayment.create({
      data: {
        sessionId: sessions[19].id,
        amount: 3500,
        paymentMethod: 'CARD',
        paymentDate: new Date(sessions[19].date),
        notes: 'Final payment - client cancelled treatment'
      }
    })
  ]);
  console.log('✅ Created sample session payments:', sessionPayments.length);

  // Update all client statuses based on their sessions and activity
  console.log('🔄 Auto-calculating client statuses...');
  const { updateClientStatus } = require('../lib/client-status');
  
  for (const client of clients) {
    try {
      const result = await updateClientStatus(client.id);
      console.log(`   Client ${client.clientId} (${client.fullName}): ${result.newStatus} - ${result.reason}`);
    } catch (error) {
      console.error(`   Failed to update status for ${client.clientId}:`, error.message);
    }
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@ojasclinic.com / admin123');
  console.log('Doctor: doctor@ojasclinic.com / admin123');
  console.log('Staff: staff@ojasclinic.com / admin123');
  console.log('\n👥 Sample Clients: 8 clients created');
  console.log('💰 Sample Payments: ' + sessionPayments.length + ' payment records created');
  console.log('✅ All client statuses auto-calculated based on activity');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
