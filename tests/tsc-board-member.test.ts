import fs from 'fs-extra';
import { logger } from '../scripts/helpers/logger';
import { generateTSCBoardMembersList } from '../scripts/tsc-board-member';

jest.mock('fs-extra');
jest.mock('../scripts/helpers/logger');

describe('generateTSCBoardMembersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const maintainers = [
    { github: 'dev1', isTscMember: true },
    { github: 'dev2', isBoardChair: true },
    { github: 'dev3' }, // no flag
  ];

  const ambassadors = [
    { github: 'dev2', isBoardMember: true }, // overlaps with dev2
    { github: 'dev4', isBoardMember: true },
    { github: 'dev5' }, // no flag
  ];

  const mergedExpected = [
    { github: 'dev1', isTscMember: true },
    { github: 'dev2', isBoardChair: true, isBoardMember: true },
    { github: 'dev4', isBoardMember: true },
  ];

  it('should merge and filter members correctly and write to file', async () => {
    (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path.includes('MAINTAINERS')) return JSON.stringify(maintainers);
      if (path.includes('AMBASSADORS')) return JSON.stringify(ambassadors);
      return '[]';
    });

    await generateTSCBoardMembersList();

    expect(fs.readFileSync).toHaveBeenCalledWith('config/MAINTAINERS.json', 'utf-8');
    expect(fs.readFileSync).toHaveBeenCalledWith('config/AMBASSADORS_MEMBERS.json', 'utf-8');

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'config/TSC_BOARD_MEMBERS.json',
      JSON.stringify(mergedExpected, null, 2)
    );

    expect(logger.info).toHaveBeenCalledWith('✅ Generated 3 filtered TSC/Board members');
  });

  it('should handle missing github field and skip merging', async () => {
    const badData = [
      { name: 'NoGitHub', isTscMember: true },
      { github: 'dev-ok', isBoardChair: true },
    ];

    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(badData));

    await generateTSCBoardMembersList();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'config/TSC_BOARD_MEMBERS.json',
      JSON.stringify([{ github: 'dev-ok', isBoardChair: true }], null, 2)
    );

    expect(logger.info).toHaveBeenCalledWith('✅ Generated 1 filtered TSC/Board members');
  });

  it('should catch and log error when reading fails', async () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('Read error');
    });

    await generateTSCBoardMembersList();

    expect(logger.error).toHaveBeenCalledWith(
      '❌ Failed to generate TSC members list:',
      expect.any(Error)
    );

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
