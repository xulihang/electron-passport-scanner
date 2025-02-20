const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { LicenseManager, CaptureVisionRouter, EnumPresetTemplate } = require('dynamsoft-capture-vision-for-node');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  ipcMain.on('capture', (event, dataurl) => {
    const webContents = event.sender
    console.log(webContents);
    console.log(dataurl);
    capture(dataurl);
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

initDCV();

function initDCV(){
  console.log("init dcv");
  LicenseManager.initLicense('DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9');
  let mrzTemplate = `{
  "CaptureVisionTemplates": [
    {
      "Name": "ReadPassportAndId",
      "OutputOriginalImage": 1,
      "ImageROIProcessingNameArray": ["roi-passport-and-id"],
      "SemanticProcessingNameArray": ["sp-passport-and-id"],
      "Timeout": 2000
    },
    {
      "Name": "ReadPassport",
      "OutputOriginalImage": 1,
      "ImageROIProcessingNameArray": ["roi-passport"],
      "SemanticProcessingNameArray": ["sp-passport"],
      "Timeout": 2000
    },
    {
      "Name": "ReadId",
      "OutputOriginalImage": 1,
      "ImageROIProcessingNameArray": ["roi-id"],
      "SemanticProcessingNameArray": ["sp-id"],
      "Timeout": 2000
    }
  ],
  "TargetROIDefOptions": [
    {
      "Name": "roi-passport-and-id",
      "TaskSettingNameArray": ["task-passport-and-id"]
    },
    {
      "Name": "roi-passport",
      "TaskSettingNameArray": ["task-passport"]
    },
    {
      "Name": "roi-id",
      "TaskSettingNameArray": ["task-id"]
    }
  ],
  "TextLineSpecificationOptions": [
    {
      "Name": "tls_mrz_passport",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [44, 44],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\\n",
      "SubGroups": [
        {
          "StringRegExPattern": "(P[A-Z<][A-Z<]{3}[A-Z<]{39}){(44)}",
          "StringLengthRange": [44, 44],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[0-9<]{4}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[0-9<][0-9]){(44)}",
          "StringLengthRange": [44, 44],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_id_td2",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [36, 36],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\\n",
      "SubGroups": [
        {
          "StringRegExPattern": "([ACI][A-Z<][A-Z<]{3}[A-Z<]{31}){(36)}",
          "StringLengthRange": [36, 36],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[0-9<]{4}[0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}",
          "StringLengthRange": [36, 36],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_mrz_id_td1",
      "BaseTextLineSpecificationName": "tls_base",
      "StringLengthRange": [30, 30],
      "OutputResults": 1,
      "ExpectedGroupsCount": 1,
      "ConcatResults": 1,
      "ConcatSeparator": "\\n",
      "SubGroups": [
        {
          "StringRegExPattern": "([ACI][A-Z<][A-Z<]{3}[A-Z0-9<]{9}[0-9<][A-Z0-9<]{15}){(30)}",
          "StringLengthRange": [30, 30],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[0-9<]{4}[0-9][A-Z<]{3}[A-Z0-9<]{11}[0-9]){(30)}",
          "StringLengthRange": [30, 30],
          "BaseTextLineSpecificationName": "tls_base"
        },
        {
          "StringRegExPattern": "([A-Z<]{30}){(30)}",
          "StringLengthRange": [30, 30],
          "BaseTextLineSpecificationName": "tls_base"
        }
      ]
    },
    {
      "Name": "tls_base",
      "CharacterModelName": "MRZ",
      "CharHeightRange": [5, 1000, 1],
      "BinarizationModes": [
        {
          "BlockSizeX": 30,
          "BlockSizeY": 30,
          "Mode": "BM_LOCAL_BLOCK",
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 15
        }
      ],
      "ConfusableCharactersCorrection": {
        "ConfusableCharacters": [
          ["0", "O"],
          ["1", "I"],
          ["5", "S"]
        ],
        "FontNameArray": ["OCR_B"]
      }
    }
  ],
  "LabelRecognizerTaskSettingOptions": [
    {
      "Name": "task-passport",
      "ConfusableCharactersPath": "ConfusableChars.data",
      "TextLineSpecificationNameArray": ["tls_mrz_passport"],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip-mrz"
        }
      ]
    },
    {
      "Name": "task-id",
      "ConfusableCharactersPath": "ConfusableChars.data",
      "TextLineSpecificationNameArray": ["tls_mrz_id_td1", "tls_mrz_id_td2"],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip-mrz"
        }
      ]
    },
    {
      "Name": "task-passport-and-id",
      "ConfusableCharactersPath": "ConfusableChars.data",
      "TextLineSpecificationNameArray": ["tls_mrz_passport", "tls_mrz_id_td1", "tls_mrz_id_td2"],
      "SectionImageParameterArray": [
        {
          "Section": "ST_REGION_PREDETECTION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_LOCALIZATION",
          "ImageParameterName": "ip-mrz"
        },
        {
          "Section": "ST_TEXT_LINE_RECOGNITION",
          "ImageParameterName": "ip-mrz"
        }
      ]
    }
  ],
  "CharacterModelOptions": [
    {
      "DirectoryPath": "",
      "Name": "MRZ"
    }
  ],
  "ImageParameterOptions": [
    {
      "Name": "ip-mrz",
      "TextureDetectionModes": [
        {
          "Mode": "TDM_GENERAL_WIDTH_CONCENTRATION",
          "Sensitivity": 8
        }
      ],
      "BinarizationModes": [
        {
          "EnableFillBinaryVacancy": 0,
          "ThresholdCompensation": 21,
          "Mode": "BM_LOCAL_BLOCK"
        }
      ],
      "TextDetectionMode": {
        "Mode": "TTDM_LINE",
        "CharHeightRange": [5, 1000, 1],
        "Direction": "HORIZONTAL",
        "Sensitivity": 7
      }
    }
  ],
  "SemanticProcessingOptions": [
    {
      "Name": "sp-passport-and-id",
      "ReferenceObjectFilter": {
        "ReferenceTargetROIDefNameArray": ["roi-passport-and-id"]
      },
      "TaskSettingNameArray": ["dcp-passport-and-id"]
    },
    {
      "Name": "sp-passport",
      "ReferenceObjectFilter": {
        "ReferenceTargetROIDefNameArray": ["roi-passport"]
      },
      "TaskSettingNameArray": ["dcp-passport"]
    },
    {
      "Name": "sp-id",
      "ReferenceObjectFilter": {
        "ReferenceTargetROIDefNameArray": ["roi-id"]
      },
      "TaskSettingNameArray": ["dcp-id"]
    }
  ],
  "CodeParserTaskSettingOptions": [
    {
      "Name": "dcp-passport",
      "CodeSpecifications": ["MRTD_TD3_PASSPORT"]
    },
    {
      "Name": "dcp-id",
      "CodeSpecifications": ["MRTD_TD1_ID", "MRTD_TD2_ID"]
    },
    {
      "Name": "dcp-passport-and-id",
      "CodeSpecifications": ["MRTD_TD3_PASSPORT", "MRTD_TD1_ID", "MRTD_TD2_ID"]
    }
  ]
}`;
CaptureVisionRouter.initSettings(mrzTemplate);
}

async function capture(dataurl){
  let response = await fetch(dataurl);
  let bytes = await response.bytes();
  let result = await CaptureVisionRouter.captureAsync(bytes, "ReadPassport");
  console.log(result);
}
