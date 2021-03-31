import Vue from '/js/vue.esm.browser.min.js'
import { ClassicTemplate } from "../templates/classic-template.js"
import { Project } from "./project.js"
import { Components } from "./components.js"
import { Selected } from "./selected.js"
import getEventHub from './event-hub.js'

const Classic = Vue.component('classic', {
  props: ['type', 'title'],
  data: function () {
      return {
          camelVersions: [],
          camelVersion: '',
          showButton: true
      }
    },
  components: {
    'project': Project,
    'components': Components,
    'selected': Selected
  },
  watch: {
    '$route.path': async function(val, oldVal){
        getEventHub().$emit('clearSelection', '');
        await this.selectCamelVersion();
    }
  },
  mounted: async function () {
      await this.selectCamelVersion();
  },
  methods: {
    generate : async function(event){
        this.showButton = false;
        const project = this.$children.find(child => { return child.$options.name === "project"; });
        const sel = this.$children.find(child => { return child.$options.name === "selected"; });
        const selected = sel.selected.map((item) => item['component']).join(",");
        axios({
            method: 'get',
            url: '/generator/'+this.type+'/'+this.camelVersion+'/'+project.group+'/'+project.artifact+'/'+project.version+'/' + selected,
            responseType: 'arraybuffer'
        }).then(response => {
            this.forceFileDownload(response);
            this.showButton = true;
        }).catch(() => {
            this.showButton = true;
            console.log('error occured');
        });
    },
    forceFileDownload(response){
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', response.headers['filename'])
          document.body.appendChild(link)
          link.click()
    },
    onChange : async function(event){
        getEventHub().$emit('versionChanged', {type: this.type, camelVersion: this.camelVersion});
    },
    selectCamelVersion: async function (event) {
        var result = [];
        const vRequest = await axios.get('/version/' + this.type);
        this.camelVersions = vRequest.data;
        this.camelVersion = this.camelVersions[0];
        getEventHub().$emit('versionChanged', {type: this.type, camelVersion: this.camelVersion});
    },
  },
  template: ClassicTemplate
});

export { Classic }