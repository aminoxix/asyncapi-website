// Imports the file system module with promise-based and extra utilities
import fs from 'fs-extra';
// Imports the custom logger for logging success or error messages
import { logger } from './helpers/logger';
// Imports type definitions for TSC and Ambassador members
import { Ambassador, Tsc } from '@/types/pages/community/Community';

// Defines a union type representing either a TSC member or an Ambassador
type Member = Tsc | Ambassador;

// Path constants for reading and writing member JSON data
const MAINTAINERS_PATH = 'config/MAINTAINERS.json';
const AMBASSADORS_PATH = 'config/AMBASSADORS_MEMBERS.json';
const OUTPUT_PATH = 'config/TSC_BOARD_MEMBERS.json';

/**
 * Reads and parses a JSON file from the given path.
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON content as an array of Member
 */
function loadJson(filePath: string): Member[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Checks if a member has a relevant leadership or board-related flag.
 * Used to filter members for the final output.
 * @param member - The member to check
 * @returns True if member is a TSC, Board Member, or Board Chair
 */
function hasRelevantFlag(member: Member): boolean {
  return member.isTscMember || member.isBoardMember || member.isBoardChair || false;
}

/**
 * Merges two arrays of members into a single deduplicated list,
 * prioritizing and combining entries by their GitHub handle.
 * Filters out members who don't have any of the relevant flags.
 * @param membersA - First list of members (e.g., maintainers)
 * @param membersB - Second list of members (e.g., ambassadors)
 * @returns A list of merged and filtered unique members
 */
function mergeUniqueMembers(membersA: Member[], membersB: Member[]): Member[] {
  const merged: Record<string, Member> = {};

  // Merge by GitHub handle, giving precedence to newer data
  [...membersA, ...membersB].forEach((member) => {
    const key = member.github
    if (!key) return;

    if (merged[key]) {
      merged[key] = { ...merged[key], ...member };
    } else {
      merged[key] = member;
    }
  });

  return Object.values(merged).filter(hasRelevantFlag);
}

/**
 * Generates a filtered list of TSC and Board members from maintainers
 * and ambassadors, then writes the result to a JSON file.
 */
export async function generateTSCBoardMembersList() {
  try {
    const maintainers = loadJson(MAINTAINERS_PATH);
    const ambassadors = loadJson(AMBASSADORS_PATH);
    const filteredMembers = mergeUniqueMembers(maintainers, ambassadors);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(filteredMembers, null, 2));
    logger.info(`✅ Generated ${filteredMembers.length} filtered TSC/Board members`);
  } catch (err) {
    logger.error('❌ Failed to generate TSC members list:', err);
  }
}

// Run script immediately if imported directly
generateTSCBoardMembersList()
