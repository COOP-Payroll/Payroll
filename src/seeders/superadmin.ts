import prisma from "../client";
import { encryptPassword } from "../utils/encryption";

async function main() {
  const superadminUsername = "IamAdmin";
  const superadminPassword = "SuperSecurePassword123";

  // 1. Create or find superadmin role
  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: {},
    create: {
      name: "superadmin",
      //   description: "Has all permissions",
    },
  });

  // 2. Fetch all permissions
  const allPermissions = await prisma.permission.findMany();

  // 3. Assign all permissions to superadmin role
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superadminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 4. Create or find superadmin user
  //   const hashedPassword = await bcrypt.hash(superadminPassword, 10);

  const superadminUser = await prisma.user.upsert({
    where: { username: superadminUsername },
    update: {},
    create: {
      name: "Super Admin",
      password: await encryptPassword(superadminPassword),
      phoneNumber: "0931653136",
      username: "superAdmin",
      companyId: "573f1842-fbd3-4eb9-85ec-f3fbadf28a29",
    },
  });

  // 5. Assign superadmin role to superadmin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superadminUser.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: {
      userId: superadminUser.id,
      roleId: superadminRole.id,
    },
  });

  console.log("✅ Superadmin user and role seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
