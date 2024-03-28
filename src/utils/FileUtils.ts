
export const DOCICONURL_XLSX = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/xlsx.png";
export const DOCICONURL_DOCX = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/docx.png";
export const DOCICONURL_PPTX = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/pptx.png";
export const DOCICONURL_MPPX = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/mpp.png";
export const DOCICONURL_PHOTO = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/photo.png";
export const DOCICONURL_PDF = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/pdf.png";
export const DOCICONURL_TXT = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/txt.png";
export const DOCICONURL_EMAIL = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/email.png";
export const DOCICONURL_CSV = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/csv.png";
export const DOCICONURL_ONE = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/one.png";
export const DOCICONURL_VSDX = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/vsdx.png";
export const DOCICONURL_VSSX = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/vssx.png";
export const DOCICONURL_PUB = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/pub.png";
export const DOCICONURL_ACCDB = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/accdb.png";
export const DOCICONURL_ZIP = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/zip.png";
export const DOCICONURL_GENERIC = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/genericfile.png";
export const DOCICONURL_CODE = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/code.png";
export const DOCICONURL_HTML = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/html.png";
export const DOCICONURL_XML = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/xml.png";
export const DOCICONURL_SPO = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/spo.png";
export const DOCICONURL_VIDEO = "https://static2.sharepointonline.com/files/fabric/assets/item-types/32/video.png";


export default class  FileUtils {
  /**
   * GetFileImageUrl
   */
  public static getFileImageUrl(_file: string): string {
    if(!_file){
      return DOCICONURL_GENERIC;
    }
    let _fileImageUrl: string = DOCICONURL_GENERIC;
    const _fileTypes = _file.split('.');
    const _fileExtension = _fileTypes[_fileTypes.length - 1];

   if ( !_fileExtension){
     return _fileImageUrl;
   }
    switch (_fileExtension.toLowerCase()) {
      case 'xlsx':
        _fileImageUrl = DOCICONURL_XLSX;
        break;
      case 'xls':
        _fileImageUrl = DOCICONURL_XLSX;
        break;
      case 'docx':
        _fileImageUrl = DOCICONURL_DOCX;
        break;
      case 'doc':
        _fileImageUrl = DOCICONURL_DOCX;
        break;
      case 'pptx':
        _fileImageUrl = DOCICONURL_PPTX;
        break;
      case 'ppt':
        _fileImageUrl = DOCICONURL_PPTX;
        break;
      case 'mppx':
        _fileImageUrl = DOCICONURL_MPPX;
        break;
      case 'mpp':
        _fileImageUrl = DOCICONURL_MPPX;
        break;
      case 'csv':
        _fileImageUrl = DOCICONURL_CSV;
        break;
      case 'pdf':
        _fileImageUrl = DOCICONURL_PDF;
        break;
      case 'txt':
        _fileImageUrl = DOCICONURL_TXT;
        break;
      case 'jpg':
        _fileImageUrl = DOCICONURL_PHOTO;
        break;
      case 'msg':
        _fileImageUrl = DOCICONURL_EMAIL;
        break;
      case 'jpeg':
        _fileImageUrl = DOCICONURL_PHOTO;
        break;
      case 'png':
        _fileImageUrl = DOCICONURL_PHOTO;
        break;
        case 'ico':
        _fileImageUrl = DOCICONURL_PHOTO;
        break;
      case 'tiff':
        _fileImageUrl = DOCICONURL_PHOTO;
        break;
      case 'eml':
        _fileImageUrl = DOCICONURL_EMAIL;
        break;
      case 'pub':
        _fileImageUrl = DOCICONURL_PUB;
        break;
      case 'accdb':
        _fileImageUrl = DOCICONURL_ACCDB;
        break;
      case 'zip':
        _fileImageUrl = DOCICONURL_ZIP;
        break;
      case '7z':
        _fileImageUrl = DOCICONURL_ZIP;
        break;
      case 'tar':
        _fileImageUrl = DOCICONURL_ZIP;
        break;
        case 'js':
        _fileImageUrl = DOCICONURL_CODE;
        break;
        case 'json':
          _fileImageUrl = DOCICONURL_CODE;
          break;
        case 'html':
        _fileImageUrl = DOCICONURL_HTML;
        break;
        case 'xml':
        _fileImageUrl = DOCICONURL_XML;
        break;
        case 'aspx':
        _fileImageUrl = DOCICONURL_SPO;
        break;
        case 'mp4':
        _fileImageUrl = DOCICONURL_VIDEO;
        break;
        case 'mov':
        _fileImageUrl = DOCICONURL_VIDEO;
        break;
        case 'wmv':
        _fileImageUrl = DOCICONURL_VIDEO;
        break;
        case 'ogg':
        _fileImageUrl = DOCICONURL_VIDEO;
        break;
        case 'webm':
        _fileImageUrl = DOCICONURL_VIDEO;
        break;
      default:
        _fileImageUrl = DOCICONURL_GENERIC;
        break;
    }
    return _fileImageUrl;
  }

  public static getShortName = (name:string):string =>{
    if (!name) return '';
    const splitedName = name.split(".");
    const displayCreatedFileName = splitedName[0].substring(0, 25);
    const displayCreatedFileNameExt = splitedName[splitedName.length-1];
    const displayCreatedFile = `${displayCreatedFileName}...${displayCreatedFileNameExt}`;
    return displayCreatedFile;
  }

  public static  isOndrive =  async (name:string):Promise<boolean> => {
    if (!name) return false;
   return name.indexOf("my.sharepoint.com") > -1;

  }
}
