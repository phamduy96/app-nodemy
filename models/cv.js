var mongoose = require("../config/dbContext");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

let cvSchema = mongoose.Schema({
  title: String,
  name: String,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'account',
    required: true,
  },  
  guest: {
    type: Boolean, 
    default: false
  },
  position: String,
  email: String,
  dob: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  address: String,
  website: String,
  github: String,
  facebook: String,
  careerGoal: String,
  titleExp: String,
  titleEdu: String,
  titleSkill: String,
  titleLang: String,
  titleAchive: String,
  titleProject: String,
  avatar: {
    type: String,
    default: `${process.env.HOST_DOMAIN_DEV}/public/images/logo.png`
  },
  experience: {
    type: [{
      startDate: Date,
      endDate: Date,
      position: String,
      company: String,
      description: String
    }],
    default: null
  },
  education: {
    type: [{
      startDate: Date,
      endDate: Date,
      school: String,
      major: String,
      description: String
    }],
    default: null
  }, 
  skill: {
    type: [{
      skillName: String,
      level: String,
      
    }],
    default: null
  }, 
  language: {
    type: [{
      language: String,
      level: String
    }],
    default: null
  },
  acchievement: {
    type: [{
      startDate: String,
      enDate: String,
      nameAchive: String,
      description: String,
    }],
    default: null
  },
  project: {
    type: [{
      startDate: String,
      endDate: String,
      name: String,
      position: String,
      link: String,
      description: String
    }],
    default: null
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


let cvModel = mongoose.model("cv", cvSchema);
module.exports = cvModel;
