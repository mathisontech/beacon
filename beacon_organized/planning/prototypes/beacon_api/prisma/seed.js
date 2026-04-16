"use strict";
/**
 * Beacon Emergency Management System - Database Seed File
 *
 * This file creates sample data for development and testing purposes.
 * Run with: npm run db:seed (or: npx tsx prisma/seed.ts)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Starting database seed...\n");
    // ============================================================================
    // ADMIN USERS
    // ============================================================================
    console.log("Creating admin users...");
    const superAdmin = await prisma.adminUser.upsert({
        where: { email: "admin@beacon-emergency.com" },
        update: {},
        create: {
            email: "admin@beacon-emergency.com",
            passwordHash: await (0, bcryptjs_1.hash)("BeaconAdmin123!", 12),
            firstName: "Sarah",
            lastName: "Chen",
            role: "SUPER_ADMIN",
            phone: "+1-555-100-0001",
            isActive: true,
            mfaEnabled: true,
        },
    });
    const platformAdmin = await prisma.adminUser.upsert({
        where: { email: "platform@beacon-emergency.com" },
        update: {},
        create: {
            email: "platform@beacon-emergency.com",
            passwordHash: await (0, bcryptjs_1.hash)("BeaconAdmin123!", 12),
            firstName: "Marcus",
            lastName: "Johnson",
            role: "PLATFORM_ADMIN",
            phone: "+1-555-100-0002",
            isActive: true,
        },
    });
    const supportAdmin = await prisma.adminUser.upsert({
        where: { email: "support@beacon-emergency.com" },
        update: {},
        create: {
            email: "support@beacon-emergency.com",
            passwordHash: await (0, bcryptjs_1.hash)("BeaconAdmin123!", 12),
            firstName: "Emily",
            lastName: "Rodriguez",
            role: "SUPPORT_ADMIN",
            isActive: true,
        },
    });
    console.log(`  Created ${3} admin users`);
    // ============================================================================
    // CLIENTS (Organizations)
    // ============================================================================
    console.log("Creating clients...");
    const montereyCounty = await prisma.client.upsert({
        where: { id: "client-monterey-county" },
        update: {},
        create: {
            id: "client-monterey-county",
            name: "Monterey County Emergency Services",
            type: "COUNTY_GOVERNMENT",
            planType: "GOVERNMENT",
            status: "ACTIVE",
            primaryContactName: "Chief Michael Torres",
            primaryContactEmail: "mtorres@montereycounty.gov",
            primaryContactPhone: "+1-831-755-5000",
            billingEmail: "billing@montereycounty.gov",
            streetAddress: "168 W Alisal St",
            city: "Salinas",
            state: "CA",
            zipCode: "93901",
            maxUsers: 100,
            maxGroups: 25,
            apiAccessEnabled: true,
            contractStartDate: new Date("2024-01-01"),
            contractEndDate: new Date("2026-12-31"),
        },
    });
    const carmeFire = await prisma.client.upsert({
        where: { id: "client-carmel-fire" },
        update: {},
        create: {
            id: "client-carmel-fire",
            name: "Carmel Valley Fire Protection District",
            type: "FIRE_DEPARTMENT",
            planType: "PROFESSIONAL",
            status: "ACTIVE",
            primaryContactName: "Captain David Kim",
            primaryContactEmail: "dkim@cvfpd.org",
            primaryContactPhone: "+1-831-659-2412",
            city: "Carmel Valley",
            state: "CA",
            zipCode: "93924",
            maxUsers: 50,
            maxGroups: 10,
            apiAccessEnabled: true,
            contractStartDate: new Date("2024-06-01"),
        },
    });
    const salinasCity = await prisma.client.upsert({
        where: { id: "client-salinas-city" },
        update: {},
        create: {
            id: "client-salinas-city",
            name: "City of Salinas Office of Emergency Services",
            type: "MUNICIPAL_GOVERNMENT",
            planType: "GOVERNMENT",
            status: "ACTIVE",
            primaryContactName: "Director Patricia Vega",
            primaryContactEmail: "pvega@ci.salinas.ca.us",
            primaryContactPhone: "+1-831-758-7000",
            streetAddress: "200 Lincoln Ave",
            city: "Salinas",
            state: "CA",
            zipCode: "93901",
            maxUsers: 75,
            maxGroups: 15,
            apiAccessEnabled: true,
        },
    });
    const communityHospital = await prisma.client.upsert({
        where: { id: "client-community-hospital" },
        update: {},
        create: {
            id: "client-community-hospital",
            name: "Community Hospital of Monterey Peninsula",
            type: "HOSPITAL",
            planType: "ENTERPRISE",
            status: "ACTIVE",
            primaryContactName: "Dr. Amanda Foster",
            primaryContactEmail: "afoster@chomp.org",
            primaryContactPhone: "+1-831-624-5311",
            streetAddress: "23625 Holman Hwy",
            city: "Monterey",
            state: "CA",
            zipCode: "93940",
            maxUsers: 200,
            maxGroups: 30,
        },
    });
    const trialClient = await prisma.client.upsert({
        where: { id: "client-trial-demo" },
        update: {},
        create: {
            id: "client-trial-demo",
            name: "Demo Fire Department",
            type: "FIRE_DEPARTMENT",
            planType: "FREE_TRIAL",
            status: "ACTIVE",
            primaryContactName: "Demo User",
            primaryContactEmail: "demo@example.com",
            city: "Demo City",
            state: "CA",
            maxUsers: 5,
            maxGroups: 2,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
    });
    console.log(`  Created ${5} clients`);
    // ============================================================================
    // EMS USERS
    // ============================================================================
    console.log("Creating EMS users...");
    const incidentCommander = await prisma.eMSUser.upsert({
        where: { email: "mtorres@montereycounty.gov" },
        update: {},
        create: {
            email: "mtorres@montereycounty.gov",
            passwordHash: await (0, bcryptjs_1.hash)("EMSPassword123!", 12),
            firstName: "Michael",
            lastName: "Torres",
            role: "INCIDENT_COMMANDER",
            badgeNumber: "MC-001",
            phone: "+1-831-755-5001",
            certifications: ["ICS-100", "ICS-200", "ICS-300", "ICS-400", "EMT-P"],
            isActive: true,
            clientId: montereyCounty.id,
        },
    });
    const operationsChief = await prisma.eMSUser.upsert({
        where: { email: "jsmith@montereycounty.gov" },
        update: {},
        create: {
            email: "jsmith@montereycounty.gov",
            passwordHash: await (0, bcryptjs_1.hash)("EMSPassword123!", 12),
            firstName: "Jennifer",
            lastName: "Smith",
            role: "OPERATIONS_CHIEF",
            badgeNumber: "MC-015",
            phone: "+1-831-755-5015",
            certifications: ["ICS-100", "ICS-200", "ICS-300", "Hazmat-Tech"],
            isActive: true,
            clientId: montereyCounty.id,
        },
    });
    const dispatcher = await prisma.eMSUser.upsert({
        where: { email: "rgarcia@montereycounty.gov" },
        update: {},
        create: {
            email: "rgarcia@montereycounty.gov",
            passwordHash: await (0, bcryptjs_1.hash)("EMSPassword123!", 12),
            firstName: "Roberto",
            lastName: "Garcia",
            role: "DISPATCHER",
            badgeNumber: "MC-042",
            phone: "+1-831-755-5042",
            certifications: ["ICS-100", "CAD-Certified", "CPR"],
            isActive: true,
            isOnDuty: true,
            clientId: montereyCounty.id,
        },
    });
    const fieldResponder1 = await prisma.eMSUser.upsert({
        where: { email: "dkim@cvfpd.org" },
        update: {},
        create: {
            email: "dkim@cvfpd.org",
            passwordHash: await (0, bcryptjs_1.hash)("EMSPassword123!", 12),
            firstName: "David",
            lastName: "Kim",
            role: "FIELD_RESPONDER",
            badgeNumber: "CV-101",
            phone: "+1-831-659-2413",
            certifications: ["Firefighter-II", "EMT-B", "Wildland-FFT2", "S-190", "S-130"],
            isActive: true,
            isOnDuty: true,
            lastLocationLat: 36.4805,
            lastLocationLng: -121.7322,
            lastLocationAt: new Date(),
            clientId: carmeFire.id,
        },
    });
    const fieldResponder2 = await prisma.eMSUser.upsert({
        where: { email: "alee@cvfpd.org" },
        update: {},
        create: {
            email: "alee@cvfpd.org",
            passwordHash: await (0, bcryptjs_1.hash)("EMSPassword123!", 12),
            firstName: "Andrew",
            lastName: "Lee",
            role: "FIELD_RESPONDER",
            badgeNumber: "CV-108",
            certifications: ["Firefighter-I", "EMT-B", "S-190"],
            isActive: true,
            clientId: carmeFire.id,
        },
    });
    const analyst = await prisma.eMSUser.upsert({
        where: { email: "kpatel@montereycounty.gov" },
        update: {},
        create: {
            email: "kpatel@montereycounty.gov",
            passwordHash: await (0, bcryptjs_1.hash)("EMSPassword123!", 12),
            firstName: "Kavita",
            lastName: "Patel",
            role: "ANALYST",
            phone: "+1-831-755-5088",
            certifications: ["GIS-Professional", "ICS-100"],
            isActive: true,
            clientId: montereyCounty.id,
        },
    });
    console.log(`  Created ${6} EMS users`);
    // ============================================================================
    // PUBLIC USERS
    // ============================================================================
    console.log("Creating public users...");
    const publicUser1 = await prisma.publicUser.upsert({
        where: { email: "john.doe@email.com" },
        update: {},
        create: {
            email: "john.doe@email.com",
            passwordHash: await (0, bcryptjs_1.hash)("PublicUser123!", 12),
            firstName: "John",
            lastName: "Doe",
            displayName: "JohnD",
            phone: "+1-831-555-0101",
            verificationLevel: "PHONE_VERIFIED",
            homeLocationLat: 36.6002,
            homeLocationLng: -121.8947,
            homeZipCode: "93940",
            notificationRadius: 25,
            pushNotifications: true,
            emailNotifications: true,
            shareLocationDuringEmergency: true,
        },
    });
    const publicUser2 = await prisma.publicUser.upsert({
        where: { email: "maria.santos@email.com" },
        update: {},
        create: {
            email: "maria.santos@email.com",
            passwordHash: await (0, bcryptjs_1.hash)("PublicUser123!", 12),
            firstName: "Maria",
            lastName: "Santos",
            displayName: "MariaSantos",
            phone: "+1-831-555-0202",
            verificationLevel: "IDENTITY_VERIFIED",
            bio: "Community volunteer and neighborhood watch coordinator",
            homeLocationLat: 36.6777,
            homeLocationLng: -121.6555,
            homeZipCode: "93901",
            notificationRadius: 30,
            pushNotifications: true,
            smsNotifications: true,
            shareLocationDuringEmergency: true,
        },
    });
    const publicUser3 = await prisma.publicUser.upsert({
        where: { email: "alex.thompson@email.com" },
        update: {},
        create: {
            email: "alex.thompson@email.com",
            passwordHash: await (0, bcryptjs_1.hash)("PublicUser123!", 12),
            firstName: "Alex",
            lastName: "Thompson",
            displayName: "AlexT",
            verificationLevel: "EMAIL_VERIFIED",
            homeZipCode: "93924",
            notificationRadius: 15,
            pushNotifications: true,
        },
    });
    const publicUser4 = await prisma.publicUser.upsert({
        where: { email: "lisa.chen@email.com" },
        update: {},
        create: {
            email: "lisa.chen@email.com",
            passwordHash: await (0, bcryptjs_1.hash)("PublicUser123!", 12),
            firstName: "Lisa",
            lastName: "Chen",
            displayName: "LisaC",
            phone: "+1-831-555-0404",
            verificationLevel: "TRUSTED_MEMBER",
            bio: "CERT trained volunteer",
            homeLocationLat: 36.5552,
            homeLocationLng: -121.9232,
            homeZipCode: "93950",
            shareLocationDuringEmergency: true,
        },
    });
    const publicUser5 = await prisma.publicUser.upsert({
        where: { email: "demo.user@email.com" },
        update: {},
        create: {
            email: "demo.user@email.com",
            passwordHash: await (0, bcryptjs_1.hash)("DemoUser123!", 12),
            firstName: "Demo",
            lastName: "User",
            displayName: "DemoUser",
            verificationLevel: "EMAIL_VERIFIED",
            homeZipCode: "93940",
        },
    });
    console.log(`  Created ${5} public users`);
    // ============================================================================
    // GROUPS
    // ============================================================================
    console.log("Creating groups...");
    const countyICS = await prisma.group.create({
        data: {
            name: "Monterey County ICS Command",
            description: "Incident Command System coordination for major county-wide events",
            type: "COMMAND",
            isActive: true,
            isPublic: false,
            clientId: montereyCounty.id,
        },
    });
    const wildlandTeam = await prisma.group.create({
        data: {
            name: "Wildland Fire Strike Team",
            description: "Specialized wildfire response unit for Carmel Valley region",
            type: "EMERGENCY_RESPONSE",
            isActive: true,
            baseLocationLat: 36.4805,
            baseLocationLng: -121.7322,
            operationalRadius: 50,
            clientId: carmeFire.id,
        },
    });
    const certTeam = await prisma.group.create({
        data: {
            name: "Salinas CERT Team",
            description: "Community Emergency Response Team for Salinas area",
            type: "VOLUNTEER",
            isActive: true,
            isPublic: true,
            maxMembers: 50,
            baseLocationLat: 36.6777,
            baseLocationLng: -121.6555,
            operationalRadius: 15,
            clientId: salinasCity.id,
        },
    });
    const neighborhoodWatch = await prisma.group.create({
        data: {
            name: "Pacific Grove Neighborhood Watch",
            description: "Community safety and emergency preparedness for Pacific Grove",
            type: "NEIGHBORHOOD_WATCH",
            isActive: true,
            isPublic: true,
            maxMembers: 100,
            clientId: montereyCounty.id,
        },
    });
    console.log(`  Created ${4} groups`);
    // ============================================================================
    // GROUP MEMBERSHIPS
    // ============================================================================
    console.log("Creating group memberships...");
    await prisma.eMSGroupMember.createMany({
        data: [
            { userId: incidentCommander.id, groupId: countyICS.id, isLeader: true },
            { userId: operationsChief.id, groupId: countyICS.id, isLeader: false },
            { userId: analyst.id, groupId: countyICS.id, isLeader: false },
            { userId: fieldResponder1.id, groupId: wildlandTeam.id, isLeader: true },
            { userId: fieldResponder2.id, groupId: wildlandTeam.id, isLeader: false },
        ],
        skipDuplicates: true,
    });
    await prisma.publicGroupMember.createMany({
        data: [
            { userId: publicUser2.id, groupId: certTeam.id, isLeader: true, contributionScore: 150 },
            { userId: publicUser4.id, groupId: certTeam.id, isLeader: false, contributionScore: 85 },
            { userId: publicUser1.id, groupId: neighborhoodWatch.id, isLeader: false, contributionScore: 25 },
            { userId: publicUser4.id, groupId: neighborhoodWatch.id, isLeader: true, contributionScore: 120 },
        ],
        skipDuplicates: true,
    });
    console.log(`  Created ${9} group memberships`);
    // ============================================================================
    // EVENTS
    // ============================================================================
    console.log("Creating events...");
    const wildfireEvent = await prisma.event.create({
        data: {
            name: "Carmel Valley Wildfire - River Road",
            description: "Vegetation fire reported near River Road and Carmel Valley Road. Fire is wind-driven, moving northeast.",
            type: "WILDFIRE",
            severity: "SEVERE",
            status: "ACTIVE_RESPONSE",
            locationLat: 36.4789,
            locationLng: -121.7156,
            locationName: "River Road & Carmel Valley Road, Carmel Valley",
            startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            estimatedAffectedPopulation: 2500,
            isPublic: true,
            requiresEvacuation: true,
            clientId: carmeFire.id,
            createdByEMSId: fieldResponder1.id,
        },
    });
    const floodWatch = await prisma.event.create({
        data: {
            name: "Salinas River Flood Watch",
            description: "Heavy rainfall expected over the next 48 hours. Salinas River may exceed flood stage in low-lying areas.",
            type: "FLOOD",
            severity: "MODERATE",
            status: "MONITORING",
            locationLat: 36.6696,
            locationLng: -121.6456,
            locationName: "Salinas River Basin",
            isPublic: true,
            requiresEvacuation: false,
            clientId: montereyCounty.id,
            createdByEMSId: incidentCommander.id,
        },
    });
    const powerOutage = await prisma.event.create({
        data: {
            name: "Pacific Grove Power Outage",
            description: "Planned power shutoff due to high wind conditions affecting approximately 3,000 customers.",
            type: "UTILITY_OUTAGE",
            severity: "MINOR",
            status: "ACTIVE_RESPONSE",
            locationLat: 36.6177,
            locationLng: -121.9166,
            locationName: "Pacific Grove, CA",
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            expectedEndAt: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
            estimatedAffectedPopulation: 3000,
            isPublic: true,
            clientId: montereyCounty.id,
            createdByAdminId: platformAdmin.id,
        },
    });
    const earthquakeEvent = await prisma.event.create({
        data: {
            name: "M4.2 Earthquake - Hollister",
            description: "Magnitude 4.2 earthquake recorded 5 miles NE of Hollister. No damage reported.",
            type: "EARTHQUAKE",
            severity: "MINOR",
            status: "RESOLVED",
            locationLat: 36.8694,
            locationLng: -121.3955,
            locationName: "5 miles NE of Hollister, CA",
            startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
            resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
            externalId: "nc73891234",
            externalSource: "USGS",
            externalUrl: "https://earthquake.usgs.gov/earthquakes/eventpage/nc73891234",
            isPublic: true,
            createdByAdminId: superAdmin.id,
        },
    });
    console.log(`  Created ${4} events`);
    // ============================================================================
    // EVENT WORKSPACES
    // ============================================================================
    console.log("Creating event workspaces...");
    const wildfireCommandWorkspace = await prisma.eventWorkspace.create({
        data: {
            name: "Wildfire Incident Command",
            description: "Central coordination workspace for wildfire response",
            eventId: wildfireEvent.id,
            groupId: countyICS.id,
        },
    });
    const wildfireFieldWorkspace = await prisma.eventWorkspace.create({
        data: {
            name: "Field Operations",
            description: "Field team coordination and status updates",
            eventId: wildfireEvent.id,
            groupId: wildlandTeam.id,
        },
    });
    const floodWorkspace = await prisma.eventWorkspace.create({
        data: {
            name: "Flood Monitoring",
            description: "River level monitoring and preparation coordination",
            eventId: floodWatch.id,
        },
    });
    console.log(`  Created ${3} event workspaces`);
    // ============================================================================
    // WORKSPACE PARTICIPANTS
    // ============================================================================
    console.log("Creating workspace participants...");
    await prisma.workspaceParticipant.createMany({
        data: [
            { workspaceId: wildfireCommandWorkspace.id, emsUserId: incidentCommander.id, accessLevel: "ADMIN" },
            { workspaceId: wildfireCommandWorkspace.id, emsUserId: operationsChief.id, accessLevel: "MANAGER" },
            { workspaceId: wildfireCommandWorkspace.id, emsUserId: analyst.id, accessLevel: "CONTRIBUTOR" },
            { workspaceId: wildfireFieldWorkspace.id, emsUserId: fieldResponder1.id, accessLevel: "MANAGER" },
            { workspaceId: wildfireFieldWorkspace.id, emsUserId: fieldResponder2.id, accessLevel: "CONTRIBUTOR" },
            { workspaceId: floodWorkspace.id, emsUserId: incidentCommander.id, accessLevel: "ADMIN" },
            { workspaceId: floodWorkspace.id, emsUserId: dispatcher.id, accessLevel: "VIEWER" },
        ],
    });
    console.log(`  Created ${7} workspace participants`);
    // ============================================================================
    // PERSON STATUSES
    // ============================================================================
    console.log("Creating person statuses...");
    await prisma.personStatus.createMany({
        data: [
            {
                reporterType: "SELF",
                subjectType: "SELF",
                safetyStatus: "SAFE",
                confidence: "CONFIRMED",
                locationLat: 36.4856,
                locationLng: -121.7089,
                locationDescription: "Evacuated to Carmel Middle School",
                eventId: wildfireEvent.id,
                reportedByPublicId: publicUser1.id,
                subjectUserId: publicUser1.id,
            },
            {
                reporterType: "FAMILY_MEMBER",
                subjectType: "FAMILY_MEMBER",
                subjectName: "Robert Doe",
                numberOfPeople: 3,
                safetyStatus: "EVACUATING",
                confidence: "REPORTED",
                locationDescription: "En route to Monterey",
                eventId: wildfireEvent.id,
                reportedByPublicId: publicUser1.id,
            },
            {
                reporterType: "RESPONDER",
                subjectType: "OTHER_PERSON",
                subjectName: "Elderly resident",
                safetyStatus: "NEEDS_ASSISTANCE",
                confidence: "CONFIRMED",
                needsDescription: "Requires medical transport, mobility limited",
                locationLat: 36.4801,
                locationLng: -121.7234,
                locationDescription: "123 Valley View Road",
                isVerified: true,
                verifiedAt: new Date(),
                eventId: wildfireEvent.id,
                reportedByEMSId: fieldResponder1.id,
            },
            {
                reporterType: "SELF",
                subjectType: "SELF",
                safetyStatus: "SHELTERING",
                confidence: "CONFIRMED",
                locationLat: 36.4902,
                locationLng: -121.7012,
                locationDescription: "At home - staying put per advisory",
                eventId: wildfireEvent.id,
                reportedByPublicId: publicUser3.id,
                subjectUserId: publicUser3.id,
            },
        ],
    });
    console.log(`  Created ${4} person statuses`);
    // ============================================================================
    // MAP TAGS
    // ============================================================================
    console.log("Creating map tags...");
    const shelterTag = await prisma.mapTag.create({
        data: {
            title: "Carmel Middle School - Evacuation Shelter",
            description: "Red Cross shelter open for wildfire evacuees. Pet-friendly. Capacity: 200",
            creatorType: "EMS_USER",
            tagType: "SHELTER",
            visibility: "PUBLIC",
            status: "VERIFIED",
            locationLat: 36.5458,
            locationLng: -121.9236,
            locationAddress: "4380 Carmel Valley Rd, Carmel, CA 93923",
            confirmationCount: 5,
            eventId: wildfireEvent.id,
            createdByEMSId: incidentCommander.id,
        },
    });
    const roadClosureTag = await prisma.mapTag.create({
        data: {
            title: "Road Closed - Carmel Valley Road",
            description: "Road closed at mile marker 12 due to active fire. Use alternate routes.",
            creatorType: "EMS_USER",
            tagType: "ROAD_CLOSURE",
            visibility: "PUBLIC",
            status: "ACTIVE",
            locationLat: 36.4789,
            locationLng: -121.7156,
            radiusMeters: 500,
            validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
            eventId: wildfireEvent.id,
            workspaceId: wildfireCommandWorkspace.id,
            createdByEMSId: fieldResponder1.id,
        },
    });
    const hazardTag = await prisma.mapTag.create({
        data: {
            title: "Downed Power Lines",
            description: "PG&E notified. Stay clear of area.",
            creatorType: "PUBLIC_USER",
            tagType: "HAZARD",
            visibility: "PUBLIC",
            status: "UNVERIFIED",
            locationLat: 36.4832,
            locationLng: -121.7098,
            locationAddress: "Near 500 Via Contenta",
            confirmationCount: 2,
            eventId: wildfireEvent.id,
            createdByPublicId: publicUser2.id,
        },
    });
    const waterDistributionTag = await prisma.mapTag.create({
        data: {
            title: "Water Distribution Point",
            description: "Free water bottles available. Operated by Red Cross.",
            creatorType: "EMS_USER",
            tagType: "WATER_DISTRIBUTION",
            visibility: "PUBLIC",
            status: "ACTIVE",
            locationLat: 36.5501,
            locationLng: -121.9199,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
            eventId: wildfireEvent.id,
            createdByEMSId: operationsChief.id,
        },
    });
    const stagingAreaTag = await prisma.mapTag.create({
        data: {
            title: "Incident Staging Area - East",
            description: "Equipment staging and personnel check-in",
            creatorType: "EMS_USER",
            tagType: "STAGING_AREA",
            visibility: "RESPONDERS_ONLY",
            status: "ACTIVE",
            locationLat: 36.4912,
            locationLng: -121.6989,
            radiusMeters: 200,
            eventId: wildfireEvent.id,
            workspaceId: wildfireFieldWorkspace.id,
            createdByEMSId: fieldResponder1.id,
        },
    });
    console.log(`  Created ${5} map tags`);
    // ============================================================================
    // TAG CONFIRMATIONS
    // ============================================================================
    console.log("Creating tag confirmations...");
    await prisma.tagConfirmation.createMany({
        data: [
            { tagId: shelterTag.id, isConfirmation: true, confirmedByEMSId: operationsChief.id },
            { tagId: shelterTag.id, isConfirmation: true, confirmedByPublicId: publicUser1.id, comment: "Confirmed - arrived here safely" },
            { tagId: hazardTag.id, isConfirmation: true, confirmedByPublicId: publicUser4.id, comment: "Can confirm, saw it while evacuating" },
            { tagId: roadClosureTag.id, isConfirmation: true, confirmedByEMSId: fieldResponder2.id },
        ],
    });
    console.log(`  Created ${4} tag confirmations`);
    // ============================================================================
    // COMMUNITY POSTS
    // ============================================================================
    console.log("Creating community posts...");
    const post1 = await prisma.communityPost.create({
        data: {
            title: "Offering spare room for evacuees",
            content: "I have a spare bedroom in Pacific Grove available for anyone displaced by the Carmel Valley fire. Pet-friendly, can accommodate 2-3 people. DM me for details.",
            postType: "RESOURCE_OFFER",
            reviewStatus: "APPROVED",
            postStatus: "PUBLISHED",
            locationLat: 36.6177,
            locationLng: -121.9166,
            locationName: "Pacific Grove, CA",
            upvoteCount: 24,
            commentCount: 3,
            viewCount: 156,
            authorId: publicUser4.id,
            eventId: wildfireEvent.id,
        },
    });
    const post2 = await prisma.communityPost.create({
        data: {
            title: "Looking for my cat - last seen near evacuation zone",
            content: "Orange tabby named Whiskers, wearing blue collar. Last seen near River Road before evacuation. Please contact me if spotted.",
            postType: "RESOURCE_REQUEST",
            reviewStatus: "APPROVED",
            postStatus: "PUBLISHED",
            imageUrls: [],
            upvoteCount: 45,
            commentCount: 8,
            viewCount: 312,
            authorId: publicUser1.id,
            eventId: wildfireEvent.id,
        },
    });
    const post3 = await prisma.communityPost.create({
        data: {
            title: "Road conditions update - Highway 68",
            content: "Highway 68 is currently clear but expect delays near Laguna Seca due to emergency vehicle traffic. Plan extra time.",
            postType: "SITUATION_REPORT",
            reviewStatus: "AUTO_APPROVED",
            postStatus: "PUBLISHED",
            upvoteCount: 67,
            commentCount: 5,
            viewCount: 523,
            authorId: publicUser2.id,
            eventId: wildfireEvent.id,
        },
    });
    const post4 = await prisma.communityPost.create({
        data: {
            title: "Thank you to all first responders",
            content: "Just want to express gratitude to all the firefighters, EMTs, and volunteers working around the clock. You are heroes.",
            postType: "THANK_YOU",
            reviewStatus: "AUTO_APPROVED",
            postStatus: "PUBLISHED",
            upvoteCount: 234,
            commentCount: 42,
            viewCount: 1205,
            authorId: publicUser3.id,
            eventId: wildfireEvent.id,
        },
    });
    console.log(`  Created ${4} community posts`);
    // ============================================================================
    // POST VOTES
    // ============================================================================
    console.log("Creating post votes...");
    await prisma.postVote.createMany({
        data: [
            { postId: post1.id, userId: publicUser1.id, isUpvote: true },
            { postId: post1.id, userId: publicUser2.id, isUpvote: true },
            { postId: post2.id, userId: publicUser2.id, isUpvote: true },
            { postId: post2.id, userId: publicUser4.id, isUpvote: true },
            { postId: post3.id, userId: publicUser1.id, isUpvote: true },
            { postId: post4.id, userId: publicUser1.id, isUpvote: true },
            { postId: post4.id, userId: publicUser2.id, isUpvote: true },
            { postId: post4.id, userId: publicUser4.id, isUpvote: true },
        ],
    });
    console.log(`  Created ${8} post votes`);
    // ============================================================================
    // POST COMMENTS
    // ============================================================================
    console.log("Creating post comments...");
    const comment1 = await prisma.postComment.create({
        data: {
            content: "This is so kind of you! Shared with my neighbors.",
            postId: post1.id,
            authorId: publicUser2.id,
        },
    });
    await prisma.postComment.create({
        data: {
            content: "Thank you! Several people reached out.",
            postId: post1.id,
            authorId: publicUser4.id,
            parentId: comment1.id,
        },
    });
    await prisma.postComment.create({
        data: {
            content: "I'll keep an eye out. What area near River Road?",
            postId: post2.id,
            authorId: publicUser2.id,
        },
    });
    await prisma.postComment.create({
        data: {
            content: "Confirmed - just drove that route. About 15 min delay.",
            postId: post3.id,
            authorId: publicUser4.id,
        },
    });
    console.log(`  Created ${4} post comments`);
    // ============================================================================
    // ALERTS
    // ============================================================================
    console.log("Creating alerts...");
    const evacAlert = await prisma.alert.create({
        data: {
            title: "Evacuation Order - Carmel Valley Zone 4",
            message: "Mandatory evacuation order issued for Carmel Valley Zone 4 due to approaching wildfire. Leave immediately via Carmel Valley Road westbound. Shelter available at Carmel Middle School.",
            alertType: "EMERGENCY",
            source: "LOCAL_GOVERNMENT",
            severity: "SEVERE",
            targetLocationLat: 36.4789,
            targetLocationLng: -121.7156,
            targetRadiusMiles: 5,
            targetZipCodes: ["93924"],
            effectiveAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            isActive: true,
            eventId: wildfireEvent.id,
            clientId: montereyCounty.id,
            createdByAdminId: platformAdmin.id,
        },
    });
    const warningAlert = await prisma.alert.create({
        data: {
            title: "Evacuation Warning - Carmel Valley Zone 5",
            message: "Evacuation WARNING for Carmel Valley Zone 5. Be prepared to leave on short notice. Gather essential items and important documents now.",
            alertType: "WARNING",
            source: "LOCAL_GOVERNMENT",
            severity: "MODERATE",
            targetLocationLat: 36.4856,
            targetLocationLng: -121.7245,
            targetRadiusMiles: 3,
            targetZipCodes: ["93924"],
            effectiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            isActive: true,
            eventId: wildfireEvent.id,
            clientId: montereyCounty.id,
        },
    });
    const floodAlert = await prisma.alert.create({
        data: {
            title: "Flood Watch - Salinas River Basin",
            message: "A Flood Watch is in effect for the Salinas River Basin from Wednesday evening through Friday morning. 2-4 inches of rain expected.",
            alertType: "WATCH",
            source: "NWS",
            severity: "MODERATE",
            targetZipCodes: ["93901", "93905", "93906", "93907"],
            externalId: "NWS-MTR-FL.W.0012",
            externalUrl: "https://alerts.weather.gov/cap/wwacapget.php?x=CA125B3F7ABC",
            effectiveAt: new Date(),
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
            isActive: true,
            eventId: floodWatch.id,
            clientId: montereyCounty.id,
        },
    });
    const pspsAlert = await prisma.alert.create({
        data: {
            title: "Public Safety Power Shutoff - Pacific Grove",
            message: "PG&E has initiated a Public Safety Power Shutoff affecting Pacific Grove. Estimated restoration: 10:00 PM tonight. Prepare for extended outage.",
            alertType: "ADVISORY",
            source: "LOCAL_GOVERNMENT",
            severity: "MINOR",
            targetZipCodes: ["93950"],
            effectiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
            isActive: true,
            eventId: powerOutage.id,
            clientId: montereyCounty.id,
        },
    });
    console.log(`  Created ${4} alerts`);
    // ============================================================================
    // USER NOTIFICATIONS
    // ============================================================================
    console.log("Creating user notifications...");
    await prisma.userNotification.createMany({
        data: [
            {
                type: "EMERGENCY_BROADCAST",
                title: evacAlert.title,
                message: evacAlert.message,
                sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
                deliveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5000),
                readAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
                userId: publicUser1.id,
                alertId: evacAlert.id,
            },
            {
                type: "PUSH",
                title: warningAlert.title,
                message: warningAlert.message,
                sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                deliveredAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 3000),
                userId: publicUser3.id,
                alertId: warningAlert.id,
            },
            {
                type: "SMS",
                title: "Safety Check Request",
                message: "Monterey County Emergency Services is checking on residents. Please mark yourself safe in the Beacon app.",
                sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
                deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 8000),
                readAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
                actionUrl: "/safety-check",
                userId: publicUser1.id,
                sentByEMSId: dispatcher.id,
            },
            {
                type: "PUSH",
                title: pspsAlert.title,
                message: pspsAlert.message,
                sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000),
                userId: publicUser4.id,
                alertId: pspsAlert.id,
            },
            {
                type: "IN_APP",
                title: "New community post in your area",
                message: "Someone is offering housing assistance for evacuees near you.",
                sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                actionUrl: `/community/posts/${post1.id}`,
                userId: publicUser1.id,
            },
        ],
    });
    console.log(`  Created ${5} user notifications`);
    // ============================================================================
    // EMERGENCY CONTACTS
    // ============================================================================
    console.log("Creating emergency contacts...");
    await prisma.emergencyContact.createMany({
        data: [
            // Global contacts
            {
                name: "911 Emergency Services",
                category: "POLICE",
                phone: "911",
                description: "For life-threatening emergencies",
                is24Hours: true,
                displayOrder: 1,
            },
            {
                name: "Poison Control Center",
                category: "POISON_CONTROL",
                phone: "1-800-222-1222",
                website: "https://www.poison.org",
                is24Hours: true,
                displayOrder: 2,
            },
            {
                name: "National Suicide Prevention Lifeline",
                category: "MENTAL_HEALTH",
                phone: "988",
                website: "https://988lifeline.org",
                is24Hours: true,
                displayOrder: 3,
            },
            {
                name: "FEMA",
                category: "FEMA",
                phone: "1-800-621-3362",
                website: "https://www.fema.gov",
                description: "Federal disaster assistance",
                displayOrder: 4,
            },
            {
                name: "American Red Cross",
                category: "RED_CROSS",
                phone: "1-800-733-2767",
                website: "https://www.redcross.org",
                description: "Disaster relief and emergency assistance",
                is24Hours: true,
                displayOrder: 5,
            },
            // Monterey County specific
            {
                name: "Monterey County Sheriff's Office",
                category: "POLICE",
                phone: "831-755-5111",
                alternatePhone: "831-755-3722",
                address: "1414 Natividad Rd, Salinas, CA 93906",
                website: "https://www.montereysheriff.org",
                is24Hours: true,
                locationLat: 36.6983,
                locationLng: -121.6352,
                clientId: montereyCounty.id,
                displayOrder: 1,
            },
            {
                name: "CAL FIRE San Benito-Monterey Unit",
                category: "FIRE",
                phone: "831-333-2600",
                website: "https://www.fire.ca.gov/units/sanbenito-monterey/",
                clientId: montereyCounty.id,
                displayOrder: 2,
            },
            {
                name: "Monterey County Health Department",
                category: "MEDICAL",
                phone: "831-755-4500",
                address: "1270 Natividad Rd, Salinas, CA 93906",
                website: "https://www.co.monterey.ca.us/government/departments-a-h/health",
                clientId: montereyCounty.id,
                displayOrder: 3,
            },
            {
                name: "PG&E Emergency Line",
                category: "UTILITY_ELECTRIC",
                phone: "1-800-743-5002",
                website: "https://www.pge.com",
                description: "Report outages or downed power lines",
                is24Hours: true,
                clientId: montereyCounty.id,
                displayOrder: 4,
            },
            {
                name: "California American Water",
                category: "UTILITY_WATER",
                phone: "831-646-3205",
                alternatePhone: "888-237-1333",
                website: "https://www.amwater.com/caaw/",
                clientId: montereyCounty.id,
                displayOrder: 5,
            },
            {
                name: "SPCA for Monterey County",
                category: "ANIMAL_SERVICES",
                phone: "831-373-2631",
                address: "1002 Monterey-Salinas Hwy, Salinas, CA 93908",
                website: "https://www.spcamc.org",
                description: "Animal rescue and emergency sheltering",
                clientId: montereyCounty.id,
                displayOrder: 6,
            },
        ],
    });
    console.log(`  Created ${11} emergency contacts`);
    // ============================================================================
    // MUTUAL AID AGREEMENTS
    // ============================================================================
    console.log("Creating mutual aid agreements...");
    await prisma.mutualAidAgreement.createMany({
        data: [
            {
                name: "Monterey County - Carmel Valley Fire Mutual Aid",
                description: "Resource sharing agreement for wildfire response",
                effectiveDate: new Date("2024-01-01"),
                expirationDate: new Date("2026-12-31"),
                autoRenewal: true,
                fromClientId: montereyCounty.id,
                toClientId: carmeFire.id,
            },
            {
                name: "Hospital Emergency Coordination",
                description: "Mass casualty incident coordination and patient transfer agreement",
                effectiveDate: new Date("2024-06-01"),
                fromClientId: communityHospital.id,
                toClientId: montereyCounty.id,
            },
        ],
    });
    console.log(`  Created ${2} mutual aid agreements`);
    // ============================================================================
    // MAP DATASETS
    // ============================================================================
    console.log("Creating map datasets...");
    const parcelDataset = await prisma.mapDataset.create({
        data: {
            name: "Monterey County Parcels 2024",
            description: "Property parcel boundaries for Monterey County",
            type: "PARCEL_DATA",
            status: "ACTIVE",
            sourceUrl: "https://data.montereycounty.gov/parcels",
            sourceAttribution: "Monterey County Assessor's Office",
            sourceUpdatedAt: new Date("2024-01-15"),
            boundsMinLat: 35.7889,
            boundsMinLng: -121.9761,
            boundsMaxLat: 36.9193,
            boundsMaxLng: -120.2131,
            featureCount: 145230,
            isPublic: false,
            createdByAdminId: superAdmin.id,
        },
    });
    const evacuationZones = await prisma.mapDataset.create({
        data: {
            name: "Carmel Valley Evacuation Zones",
            description: "Official evacuation zone boundaries for Carmel Valley",
            type: "EVACUATION_ZONES",
            status: "ACTIVE",
            sourceAttribution: "CAL FIRE / Monterey County OES",
            sourceUpdatedAt: new Date("2024-06-01"),
            boundsMinLat: 36.4,
            boundsMinLng: -121.9,
            boundsMaxLat: 36.6,
            boundsMaxLng: -121.5,
            featureCount: 12,
            isPublic: true,
            createdByAdminId: superAdmin.id,
        },
    });
    const fireHazardZones = await prisma.mapDataset.create({
        data: {
            name: "Fire Hazard Severity Zones",
            description: "CAL FIRE Fire Hazard Severity Zones for Monterey County",
            type: "FIRE_HAZARD_ZONES",
            status: "ACTIVE",
            sourceUrl: "https://osfm.fire.ca.gov/divisions/community-wildfire-preparedness-and-mitigation/wildland-hazards-building-codes/fire-hazard-severity-zones-maps/",
            sourceAttribution: "CAL FIRE",
            sourceUpdatedAt: new Date("2023-11-01"),
            boundsMinLat: 35.7889,
            boundsMinLng: -121.9761,
            boundsMaxLat: 36.9193,
            boundsMaxLng: -120.2131,
            isPublic: true,
            createdByAdminId: superAdmin.id,
        },
    });
    console.log(`  Created ${3} map datasets`);
    // ============================================================================
    // DATASET CLIENT ACCESS
    // ============================================================================
    console.log("Creating dataset access grants...");
    await prisma.datasetClientAccess.createMany({
        data: [
            { datasetId: parcelDataset.id, clientId: montereyCounty.id },
            { datasetId: parcelDataset.id, clientId: carmeFire.id },
            { datasetId: parcelDataset.id, clientId: salinasCity.id },
            { datasetId: evacuationZones.id, clientId: montereyCounty.id },
            { datasetId: evacuationZones.id, clientId: carmeFire.id },
            { datasetId: fireHazardZones.id, clientId: montereyCounty.id },
            { datasetId: fireHazardZones.id, clientId: carmeFire.id },
        ],
    });
    console.log(`  Created ${7} dataset access grants`);
    // ============================================================================
    // DEMOS
    // ============================================================================
    console.log("Creating demo configurations...");
    const wildireDemo = await prisma.demo.create({
        data: {
            name: "Wildfire Response Demo",
            description: "Interactive demonstration of wildfire incident management capabilities",
            scenarioData: {
                eventType: "WILDFIRE",
                location: { lat: 36.4789, lng: -121.7156 },
                preloadedTags: 5,
                simulatedUsers: 10,
                features: ["evacuation-zones", "real-time-updates", "community-posts"],
            },
            isActive: true,
            isPublic: true,
            accessCode: "WILDFIRE-DEMO-2024",
            maxSessions: 500,
            createdByAdminId: superAdmin.id,
        },
    });
    await prisma.demo.create({
        data: {
            name: "Flood Response Demo",
            description: "River flooding scenario for municipal governments",
            scenarioData: {
                eventType: "FLOOD",
                location: { lat: 36.6696, lng: -121.6456 },
                preloadedTags: 8,
                features: ["water-levels", "shelter-locations", "road-closures"],
            },
            isActive: true,
            isPublic: false,
            accessCode: "FLOOD-DEMO-GOV",
            maxSessions: 100,
            createdByAdminId: superAdmin.id,
        },
    });
    console.log(`  Created ${2} demo configurations`);
    // ============================================================================
    // DEMO SESSIONS
    // ============================================================================
    console.log("Creating demo sessions...");
    await prisma.demoSession.createMany({
        data: [
            {
                guestName: "Mayor Williams",
                guestEmail: "mayor@seasidecity.gov",
                guestCompany: "City of Seaside",
                startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
                feedbackRating: 5,
                feedbackComment: "Very impressive platform. Would like to schedule a follow-up call.",
                demoId: wildireDemo.id,
                conductedByAdminId: platformAdmin.id,
            },
            {
                guestName: "Fire Chief Rodriguez",
                guestEmail: "chief@kingcityfire.org",
                guestCompany: "King City Fire Department",
                startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                feedbackRating: 4,
                feedbackComment: "Great features. Need to discuss integration with existing CAD system.",
                demoId: wildireDemo.id,
                conductedByAdminId: supportAdmin.id,
            },
            {
                guestName: "Anonymous User",
                startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
                demoId: wildireDemo.id,
            },
        ],
    });
    console.log(`  Created ${3} demo sessions`);
    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log("\n========================================");
    console.log("Database seeding completed successfully!");
    console.log("========================================\n");
    console.log("Summary of created records:");
    console.log("  - 3 Admin users");
    console.log("  - 5 Clients (organizations)");
    console.log("  - 6 EMS users");
    console.log("  - 5 Public users");
    console.log("  - 4 Groups");
    console.log("  - 9 Group memberships");
    console.log("  - 4 Events");
    console.log("  - 3 Event workspaces");
    console.log("  - 7 Workspace participants");
    console.log("  - 4 Person statuses");
    console.log("  - 5 Map tags");
    console.log("  - 4 Tag confirmations");
    console.log("  - 4 Community posts");
    console.log("  - 8 Post votes");
    console.log("  - 4 Post comments");
    console.log("  - 4 Alerts");
    console.log("  - 5 User notifications");
    console.log("  - 11 Emergency contacts");
    console.log("  - 2 Mutual aid agreements");
    console.log("  - 3 Map datasets");
    console.log("  - 7 Dataset access grants");
    console.log("  - 2 Demo configurations");
    console.log("  - 3 Demo sessions");
    console.log("\nTest credentials:");
    console.log("  Admin: admin@beacon-emergency.com / BeaconAdmin123!");
    console.log("  EMS: mtorres@montereycounty.gov / EMSPassword123!");
    console.log("  Public: john.doe@email.com / PublicUser123!");
    console.log("  Demo: demo.user@email.com / DemoUser123!");
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map