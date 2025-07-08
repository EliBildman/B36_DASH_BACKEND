"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageBackups = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Paths
const sourceFolder = "./data/";
const backupFolder = path_1.default.join(sourceFolder, "backups");
// Ensure the backup folder exists
if (!fs_1.default.existsSync(backupFolder)) {
    fs_1.default.mkdirSync(backupFolder, { recursive: true });
}
// Get current datetime in nicely formatted string (YYYY-MM-DD_HH-MM-SS)
const getDateTime = () => {
    const now = new Date();
    return now.toISOString().replace(/:/g, "-").split(".")[0];
};
// Function to recursively copy contents, excluding the backups folder
const copyFolder = (src, dest) => {
    const files = fs_1.default.readdirSync(src);
    files.forEach((file) => {
        const srcPath = path_1.default.join(src, file);
        const destPath = path_1.default.join(dest, file);
        // Skip the backups folder
        if (srcPath === backupFolder || srcPath.includes(".placeholder")) {
            return;
        }
        const stats = fs_1.default.statSync(srcPath);
        if (stats.isDirectory()) {
            // Create the directory in the destination and copy its contents
            if (!fs_1.default.existsSync(destPath)) {
                fs_1.default.mkdirSync(destPath);
            }
            copyFolder(srcPath, destPath);
        }
        else if (stats.isFile()) {
            // Copy the file
            fs_1.default.copyFileSync(srcPath, destPath);
        }
    });
};
// Function to manage backups
const manageBackups = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create backup directory name
        const backupName = `backup_${getDateTime()}`;
        const backupPath = path_1.default.join(backupFolder, backupName);
        console.log("Creating backup...");
        if (!fs_1.default.existsSync(backupPath)) {
            fs_1.default.mkdirSync(backupPath);
        }
        // Copy contents of `sourceFolder` excluding `backupFolder`
        copyFolder(sourceFolder, backupPath);
        console.log(`Backup created at: ${backupPath}`);
        // Get all backup folder names
        const backups = fs_1.default
            .readdirSync(backupFolder)
            .filter((file) => file.startsWith("backup_"))
            .sort((a, b) => {
            const aTime = fs_1.default.statSync(path_1.default.join(backupFolder, a)).mtime;
            const bTime = fs_1.default.statSync(path_1.default.join(backupFolder, b)).mtime;
            return bTime.getTime() - aTime.getTime();
        });
        // If there are more than 10 backups, delete the oldest ones
        if (backups.length > 10) {
            const backupsToDelete = backups.slice(10);
            backupsToDelete.forEach((backup) => {
                const backupToDeletePath = path_1.default.join(backupFolder, backup);
                fs_1.default.rmSync(backupToDeletePath, { recursive: true, force: true });
                console.log(`Deleted old backup: ${backupToDeletePath}`);
            });
        }
    }
    catch (error) {
        console.error("Error creating backup:", error);
    }
});
exports.manageBackups = manageBackups;
