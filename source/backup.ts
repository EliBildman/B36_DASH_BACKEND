import fs from "fs";
import path from "path";

// Paths
const sourceFolder: string = "./data/";
const backupFolder: string = path.join(sourceFolder, "backups");

// Ensure the backup folder exists
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

// Get current datetime in nicely formatted string (YYYY-MM-DD_HH-MM-SS)
const getDateTime = (): string => {
  const now = new Date();
  return now.toISOString().replace(/:/g, "-").split(".")[0];
};

// Function to recursively copy contents, excluding the backups folder
const copyFolder = (src: string, dest: string): void => {
  const files: string[] = fs.readdirSync(src);

  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    // Skip the backups folder
    if (srcPath === backupFolder || srcPath.includes(".placeholder")) {
      return;
    }

    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      // Create the directory in the destination and copy its contents
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
      }
      copyFolder(srcPath, destPath);
    } else if (stats.isFile()) {
      // Copy the file
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

// Function to manage backups
export const manageBackups = async (): Promise<void> => {
  try {
    // Create backup directory name
    const backupName: string = `backup_${getDateTime()}`;
    const backupPath: string = path.join(backupFolder, backupName);

    console.log("Creating backup...");
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
    }

    // Copy contents of `sourceFolder` excluding `backupFolder`
    copyFolder(sourceFolder, backupPath);

    console.log(`Backup created at: ${backupPath}`);

    // Get all backup folder names
    const backups: string[] = fs
      .readdirSync(backupFolder)
      .filter((file) => file.startsWith("backup_"))
      .sort((a, b) => {
        const aTime: Date = fs.statSync(path.join(backupFolder, a)).mtime;
        const bTime: Date = fs.statSync(path.join(backupFolder, b)).mtime;
        return bTime.getTime() - aTime.getTime();
      });

    // If there are more than 10 backups, delete the oldest ones
    if (backups.length > 10) {
      const backupsToDelete: string[] = backups.slice(10);
      backupsToDelete.forEach((backup) => {
        const backupToDeletePath: string = path.join(backupFolder, backup);
        fs.rmSync(backupToDeletePath, { recursive: true, force: true });
        console.log(`Deleted old backup: ${backupToDeletePath}`);
      });
    }
  } catch (error) {
    console.error("Error creating backup:", error);
  }
};