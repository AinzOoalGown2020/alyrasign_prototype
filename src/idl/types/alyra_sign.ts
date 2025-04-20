export type AlyraSign = {
  "version": "0.1.0",
  "name": "alyra_sign",
  "instructions": [
    {
      "name": "createFormation",
      "accounts": [
        {
          "name": "formation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "description",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "startDate",
          "type": "i64"
        },
        {
          "name": "endDate",
          "type": "i64"
        }
      ]
    },
    {
      "name": "createSession",
      "accounts": [
        {
          "name": "session",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "formation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "description",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "addStudentToFormation",
      "accounts": [
        {
          "name": "student",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "formation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "studentWallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "firstName",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "lastName",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "email",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "markPresence",
      "accounts": [
        {
          "name": "presence",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "student",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "session",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "studentWallet",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeStorage",
      "accounts": [
        {
          "name": "storage",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "formation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "studentCount",
            "type": "u8"
          },
          {
            "name": "sessionCount",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "session",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "formation",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "description",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "student",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "formation",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "firstName",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "lastName",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "email",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "presence",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "student",
            "type": "publicKey"
          },
          {
            "name": "session",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "storage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "createdAt",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongAuthority",
      "msg": "You are not the expected authority."
    }
  ]
}; 