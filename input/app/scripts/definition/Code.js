const jsYaml = require('js-yaml')
const _ = require('lodash')
const Config = require('../Config')

class Code {
  constructor ({
    id,
    name,
    description = '',
    color, theme/* PVSCL:IFCOND(MoodleProvider) */,
    moodleLevelId/* PVSCL:ENDCOND */}) {
    this.id = id
    this.name = name
    this.color = color
    this.theme = theme
    this.description = description
    // PVSCL:IFCOND(MoodleProvider, LINE)
    this.moodleLevelId = moodleLevelId
    // PVSCL:ENDCOND
  }

  toAnnotations () {
    return [this.toAnnotation()]
  }

  toAnnotation () {
    let codeTag = Config.namespace + ':' + Config.tags.grouped.subgroup + ':' + this.name
    let isCodeOfTag = Config.namespace + ':' + Config.tags.grouped.relation + ':' + this.theme.name
    let motivationTag = Config.namespace + ':' + Config.tags.motivation + ':' + 'codebookDevelopment'
    let tags = [codeTag, isCodeOfTag, motivationTag]
    // PVSCL:IFCOND(MoodleProvider, LINE)
    let cmidTag = 'cmid:' + this.theme.annotationGuide.cmid
    tags.push(cmidTag)
    // PVSCL:ENDCOND
    return {
      id: this.id,
      group: this.theme.annotationGuide.storage.group.id,
      permissions: {
        read: ['group:' + this.theme.annotationGuide.storage.group.id]
      },
      motivation: 'codebookDevelopment',
      references: [],
      tags: tags,
      target: [],
      text: jsYaml.dump({id: this.id || '', description: this.description}),
      uri: this.theme.annotationGuide.storage.group.links.html
    }
  }

  static fromAnnotations () {
    // TODO Xabi
  }

  static fromAnnotation (annotation, theme = {}) {
    let codeTag = _.find(annotation.tags, (tag) => {
      return tag.includes(Config.namespace + ':' + Config.tags.grouped.subgroup + ':')
    })
    if (_.isString(codeTag)) {
      let name = codeTag.replace(Config.namespace + ':' + Config.tags.grouped.subgroup + ':', '')
      let config = jsYaml.load(annotation.text)
      if (_.isObject(config)) {
        let description = config.description
        let id = annotation.id
        let codeToReturn
        // PVSCL:IFCOND(MoodleProvider, LINE)
        let moodleLevelId = config.id
        codeToReturn = new Code({id, name, description, theme, moodleLevelId})
        // PVSCL:ELSECOND
        codeToReturn = new Code({id, name, description, theme})
        // PVSCL:ENDCOND
        return codeToReturn
      } else {
        console.error('Unable to retrieve mark configuration from annotation')
      }
    } else {
      console.error('Unable to retrieve mark from annotation')
    }
  }
  // PVSCL:IFCOND(ExportGroup, LINE)

  toObject () {
    return {
      name: this.name,
      description: this.description
    }
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(MoodleProvider, LINE)

  static createCodeFromObject (code, theme) {
    // Instance level object
    let instancedCode = Object.assign(new Code({}), code)
    return instancedCode
  }
  // PVSCL:ENDCOND
}

module.exports = Code
