import fs from 'fs';
import path from 'path';
import { OutputType } from 'jszip';

import { FileInfo } from '../types/types';
import { contentTracker } from './content-tracker';
import IArchive, { ArchivedFolderCallback } from '../interfaces/iarchive';
import ArchiveJszip from './archive/archive-jszip';

export class FileHelper {
  static importArchive(location: string): IArchive {
    if (!fs.existsSync(location)) {
      throw new Error('File not found: ' + location);
    }
    return new ArchiveJszip(location);
  }

  static extractFromArchive(
    archive: IArchive,
    file: string,
    type?: OutputType,
  ): Promise<any> {
    return archive.read(file, type);
  }

  static removeFromDirectory(
    archive: IArchive,
    dir: string,
    cb: ArchivedFolderCallback,
  ): string[] {
    const removed = [];
    archive.folder(dir).forEach((file) => {
      if (cb(file)) {
        archive.remove(file.name);
        removed.push(file.name);
      }
    });
    return removed;
  }

  static removeFromArchive(archive: IArchive, file: string): IArchive {
    FileHelper.check(archive, file);

    return archive.remove(file);
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).replace('.', '');
  }

  static getFileInfo(filename: string): FileInfo {
    return {
      base: path.basename(filename),
      dir: path.dirname(filename),
      isDir: filename[filename.length - 1] === '/',
      extension: path.extname(filename).replace('.', ''),
    };
  }

  static check(archive: IArchive, file: string): boolean {
    FileHelper.isArchive(archive);
    return FileHelper.fileExistsInArchive(archive, file);
  }

  static isArchive(archive) {
    if (archive === undefined) {
      throw new Error('Archive is invalid or empty.');
    }
  }

  static fileExistsInArchive(archive: IArchive, file: string): boolean {
    return archive.fileExists(file);
  }

  /**
   * Copies a file from one archive to another. The new file can have a different name to the origin.
   * @param {IArchive} sourceArchive - Source archive
   * @param {string} sourceFile - file path and name inside source archive
   * @param {IArchive} targetArchive - Target archive
   * @param {string} targetFile - file path and name inside target archive
   * @return {IArchive} targetArchive as an instance of IArchive
   */
  static async zipCopy(
    sourceArchive: IArchive,
    sourceFile: string,
    targetArchive: IArchive,
    targetFile?: string,
  ): Promise<IArchive> {
    FileHelper.check(sourceArchive, sourceFile);
    contentTracker.trackFile(targetFile);

    const content = await sourceArchive.read(sourceFile, 'nodebuffer');
    return targetArchive.write(targetFile || sourceFile, content);
  }
}

export const exists = (dir: string) => {
  return fs.existsSync(dir);
};

export const makeDirIfNotExists = (dir: string) => {
  if (!exists(dir)) {
    makeDir(dir);
  }
};

export const makeDir = (dir: string) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  } catch (err) {
    throw err;
  }
};
