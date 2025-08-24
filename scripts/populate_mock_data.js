import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Sample data for groups
const sampleGroups = [
  {
    name: "Computer Science Study Group",
    description: "A group for CS students to collaborate on projects, share resources, and help each other with coursework. We meet weekly to discuss algorithms, data structures, and programming challenges.",
    leaderId: null // Will be set dynamically
  },
  {
    name: "Hostel Room Cleaning Squad",
    description: "Organizing weekly cleaning schedules and maintaining common areas. We coordinate cleaning supplies, set up rotas, and ensure our hostel stays clean and comfortable for everyone.",
    leaderId: null
  },
  {
    name: "Weekend Movie Club",
    description: "Movie enthusiasts unite! We watch and discuss movies every weekend in the common room. From Bollywood blockbusters to Hollywood classics, we cover it all.",
    leaderId: null
  },
  {
    name: "Fitness & Gym Buddies",
    description: "Stay fit together! We organize morning runs, gym sessions, and fitness challenges. Perfect for motivation and accountability in your fitness journey.",
    leaderId: null
  },
  {
    name: "Food & Cooking Enthusiasts",
    description: "Love cooking or trying new food? Join us for cooking sessions, food reviews, and discovering the best local eateries around campus.",
    leaderId: null
  },
  {
    name: "Gaming Squad",
    description: "Gamers assemble! From mobile games to PC gaming, we organize tournaments, share gaming tips, and have fun gaming sessions together.",
    leaderId: null
  },
  {
    name: "Photography Club",
    description: "Capture memories and improve photography skills together. We organize photo walks, share editing tips, and showcase our best shots.",
    leaderId: null
  },
  {
    name: "Music & Jam Sessions",
    description: "Musicians and music lovers welcome! We organize jam sessions, share music recommendations, and sometimes perform at hostel events.",
    leaderId: null
  }
];

// Sample posts for groups
const samplePosts = [
  {
    title: "Weekly Algorithm Practice Session",
    content: "Hey everyone! This week we'll be focusing on dynamic programming problems. I've prepared a set of beginner to intermediate level questions. Let's meet in the study room on Thursday at 7 PM. Bring your laptops!"
  },
  {
    title: "New Cleaning Schedule Posted",
    content: "The new monthly cleaning schedule is up on the notice board. Please check your assigned days and times. Remember, we're all responsible for keeping our common areas clean. Thanks for your cooperation!"
  },
  {
    title: "This Weekend: Inception Movie Night",
    content: "Get ready to have your mind blown! We're watching Christopher Nolan's Inception this Saturday at 8 PM in the common room. Popcorn and snacks will be provided. Don't miss this masterpiece!"
  },
  {
    title: "Morning Run Tomorrow - 6 AM",
    content: "Who's up for a morning run tomorrow? We'll meet at the hostel entrance at 6 AM sharp. The route is about 3km around the campus. Great way to start the day with some fresh air and exercise!"
  },
  {
    title: "Cooking Session: Pasta Night!",
    content: "Let's cook together this Sunday evening! We're making different types of pasta with various sauces. If you have any special ingredients or recipes, please bring them along. Kitchen will be reserved from 6-9 PM."
  },
  {
    title: "PUBG Mobile Tournament - Registration Open",
    content: "Attention gamers! We're organizing a PUBG Mobile tournament next weekend. Registration is now open. Entry fee is ₹50 per person, winner takes 60% of the pool. Register by commenting below!"
  },
  {
    title: "Golden Hour Photo Walk This Evening",
    content: "The weather is perfect for a golden hour photo walk! Meet me at the main gate at 5:30 PM. We'll explore the campus and nearby areas for some great shots. Bring your cameras or phones!"
  },
  {
    title: "Acoustic Session Tomorrow Night",
    content: "Calling all musicians and music lovers! We're having an acoustic session tomorrow night at 8 PM in the common room. Bring your guitars, vocals, or just come to enjoy some good music and chill vibes."
  }
];

async function readEmailsFromCSV() {
  const csvPath = path.join(__dirname, '../src/config/allowed_emails.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const emails = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.includes('@'));
  
  return emails;
}

function generateName(email) {
  const username = email.split('@')[0];
  const names = [
    'Rahul', 'Priya', 'Amit', 'Sneha', 'Arjun', 'Kavita', 'Mohit', 'Anjali',
    'Manish', 'Neha', 'Vikram', 'Pooja', 'Karan', 'Divya', 'Sandeep', 'Ritu',
    'Harsh', 'Nisha', 'Gopal', 'Meena', 'Deepak', 'Alok', 'Swati', 'Rajesh',
    'Aarti', 'Shalini', 'Pradeep', 'Tarun', 'Sonali', 'Nikhil', 'Madhuri',
    'Anand', 'Rakesh', 'Jyoti', 'Abhishek', 'Meenakshi', 'Vishal', 'Shreya',
    'Sanjay', 'Kavya', 'Manoj', 'Rashmi', 'Devendra', 'Aakash', 'Rekha',
    'Sunil', 'Geeta', 'Parth'
  ];
  
  const surnames = [
    'Sharma', 'Verma', 'Kapoor', 'Patel', 'Mehra', 'Nair', 'Gupta', 'Singh',
    'Kumar', 'Rani', 'Iyer', 'Jain', 'Agarwal', 'Menon', 'Reddy', 'Chopra',
    'Bose', 'Malik', 'Pandey', 'Pillai', 'Sinha', 'Das', 'Banerjee', 'Yadav',
    'Desai', 'Shah', 'Jha', 'Bhatt', 'Rathore', 'Kulkarni', 'Rao', 'Ganguly',
    'Khatri', 'Chauhan', 'Malhotra', 'Trivedi', 'Mittal', 'Shetty', 'Chawla'
  ];
  
  // Try to extract meaningful name from email
  if (username.includes('.')) {
    const parts = username.split('.');
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : surnames[Math.floor(Math.random() * surnames.length)];
    return `${firstName} ${lastName}`;
  } else {
    const firstName = names[Math.floor(Math.random() * names.length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];
    return `${firstName} ${lastName}`;
  }
}

async function populateMockData() {
  try {
    console.log('🚀 Starting mock data population...');

    // Read emails from CSV
    const emails = await readEmailsFromCSV();
    console.log(`📧 Found ${emails.length} emails in CSV file`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Cleaning existing data...');
    await prisma.groupPost.deleteMany();
    await prisma.joinRequest.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    // Create users from CSV emails
    console.log('👥 Creating users...');
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const email of emails) {
      const name = generateName(email);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        }
      });
      users.push(user);
      console.log(`✅ Created user: ${name} (${email})`);
    }

    // Find the test user (de5ash1zh@gmail.com)
    const testUser = users.find(user => user.email === 'de5ash1zh@gmail.com');
    if (!testUser) {
      throw new Error('Test user de5ash1zh@gmail.com not found!');
    }

    // Create groups with different leaders
    console.log('🏠 Creating groups...');
    const groups = [];
    for (let i = 0; i < sampleGroups.length; i++) {
      const groupData = sampleGroups[i];
      const leader = users[i % users.length]; // Rotate through users as leaders
      
      const group = await prisma.group.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          leaderId: leader.id
        }
      });
      groups.push(group);
      console.log(`✅ Created group: ${group.name} (Leader: ${leader.name})`);
    }

    // Add members to groups (including test user in multiple groups)
    console.log('👨‍👩‍👧‍👦 Adding group members...');
    for (const group of groups) {
      // Add the leader as a member
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: group.leaderId
        }
      });

      // Add test user to all groups for testing
      if (group.leaderId !== testUser.id) {
        await prisma.groupMember.create({
          data: {
            groupId: group.id,
            userId: testUser.id
          }
        });
      }

      // Add 3-7 random members to each group
      const memberCount = Math.floor(Math.random() * 5) + 3;
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      
      let addedMembers = 0;
      for (const user of shuffledUsers) {
        if (addedMembers >= memberCount) break;
        
        // Skip if user is already leader or test user (already added)
        if (user.id === group.leaderId || user.id === testUser.id) continue;
        
        try {
          await prisma.groupMember.create({
            data: {
              groupId: group.id,
              userId: user.id
            }
          });
          addedMembers++;
        } catch (error) {
          // Skip if already a member
          continue;
        }
      }
      
      console.log(`✅ Added ${addedMembers + 1} members to ${group.name}`);
    }

    // Create some join requests (pending ones for test user to approve)
    console.log('📝 Creating join requests...');
    const nonMemberUsers = users.filter(user => user.id !== testUser.id);
    
    for (let i = 0; i < 5; i++) {
      const randomUser = nonMemberUsers[Math.floor(Math.random() * nonMemberUsers.length)];
      const randomGroup = groups[Math.floor(Math.random() * groups.length)];
      
      // Check if user is already a member
      const existingMember = await prisma.groupMember.findFirst({
        where: {
          groupId: randomGroup.id,
          userId: randomUser.id
        }
      });
      
      if (!existingMember) {
        try {
          await prisma.joinRequest.create({
            data: {
              groupId: randomGroup.id,
              userId: randomUser.id,
              message: `Hi! I'm ${randomUser.name} and I'd love to join ${randomGroup.name}. I'm really interested in the activities and would like to contribute to the group.`,
              status: 'pending'
            }
          });
          console.log(`✅ Created join request: ${randomUser.name} → ${randomGroup.name}`);
        } catch (error) {
          // Skip if request already exists
          continue;
        }
      }
    }

    // Create posts in groups
    console.log('📄 Creating group posts...');
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const post = samplePosts[i];
      
      // Get group members to choose random authors
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId: group.id },
        include: { user: true }
      });
      
      // Create 1-3 posts per group
      const postCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < postCount; j++) {
        const randomMember = groupMembers[Math.floor(Math.random() * groupMembers.length)];
        const postData = j === 0 ? post : {
          title: `Update from ${randomMember.user.name}`,
          content: `Hey everyone! Just wanted to share some thoughts about our group activities. Looking forward to our next meetup. Let me know if you have any suggestions or ideas!`
        };
        
        await prisma.groupPost.create({
          data: {
            groupId: group.id,
            authorId: randomMember.userId,
            title: postData.title,
            content: postData.content
          }
        });
      }
      
      console.log(`✅ Created ${postCount} posts for ${group.name}`);
    }

    console.log('\n🎉 Mock data population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`🏠 Groups created: ${groups.length}`);
    console.log(`📝 Test user (de5ash1zh@gmail.com) added to all groups`);
    console.log(`📄 Posts and join requests created`);
    console.log('\n🔐 All users have password: password123');
    console.log('🧪 You can now test the UI with de5ash1zh@gmail.com');

  } catch (error) {
    console.error('❌ Error populating mock data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateMockData();
