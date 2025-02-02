import { XmlHelper } from './xml-helper';
import { contentTracker as Tracker } from './content-tracker';
import { FileHelper } from './file-helper';
import IArchive from '../interfaces/iarchive';
import { XmlDocument, XmlElement } from '../types/xml-types';

export default class ModifyPresentationHelper {
  /**
   * Get Collection of slides
   */
  static getSlidesCollection = (xml: XmlDocument) => {
    return xml.getElementsByTagName('p:sldId');
  };

  /**
   * Pass an array of slide numbers to define a target sort order.
   * First slide starts by 1.
   * @order Array of slide numbers, starting by 1
   */
  static sortSlides = (order: number[]) => (xml: XmlDocument) => {
    const slides = ModifyPresentationHelper.getSlidesCollection(xml);
    order.map((index, i) => order[i]--);
    XmlHelper.sortCollection(slides, order);
  };

  /**
   * Set ids to prevent corrupted pptx.
   * Must start with 256 and increment by one.
   */
  static normalizeSlideIds = (xml: XmlDocument) => {
    const slides = ModifyPresentationHelper.getSlidesCollection(xml);
    const firstId = 256;
    XmlHelper.modifyCollection(slides, (slide: XmlElement, i) => {
      slide.setAttribute('id', String(firstId + i));
    });
  };

  /**
   * Tracker.files includes all files that have been
   * copied to the root template by automizer. We remove all other files.
   */
  static async removeUnusedFiles(
    xml: XmlDocument,
    i: number,
    archive: IArchive,
  ): Promise<void> {
    // Need to skip some dirs until masters and layouts are handled properly
    const skipDirs = [
      'ppt/slideMasters',
      'ppt/slideMasters/_rels',
      'ppt/slideLayouts',
      'ppt/slideLayouts/_rels',
    ];
    for (const dir in Tracker.files) {
      if (skipDirs.includes(dir)) {
        continue;
      }
      const requiredFiles = Tracker.files[dir];
      FileHelper.removeFromDirectory(archive, dir, (file) => {
        return !requiredFiles.includes(file.relativePath);
      });
    }
  }

  /**
   * PPT won't complain about unused items in [Content_Types].xml,
   * but we remove them anyway in case the file mentioned in PartName-
   * attribute does not exist.
   */
  static async removeUnusedContentTypes(
    xml: XmlDocument,
    i: number,
    archive: IArchive,
  ): Promise<void> {
    await XmlHelper.removeIf({
      archive,
      file: `[Content_Types].xml`,
      tag: 'Override',
      clause: (xml: XmlDocument, element: XmlElement) => {
        const filename = element.getAttribute('PartName').substring(1);
        return FileHelper.fileExistsInArchive(archive, filename) ? false : true;
      },
    });
  }

  static async removedUnusedImages(
    xml: XmlDocument,
    i: number,
    archive: IArchive,
  ): Promise<void> {
    await Tracker.analyzeContents(archive);

    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'emf'];
    const keepFiles = [];

    await Tracker.collect('ppt/slides', 'image', keepFiles);
    await Tracker.collect('ppt/slideMasters', 'image', keepFiles);
    await Tracker.collect('ppt/slideLayouts', 'image', keepFiles);

    FileHelper.removeFromDirectory(archive, 'ppt/media', (file) => {
      const info = FileHelper.getFileInfo(file.name);
      return (
        extensions.includes(info.extension.toLowerCase()) &&
        !keepFiles.includes(info.base)
      );
    });
  }
}
