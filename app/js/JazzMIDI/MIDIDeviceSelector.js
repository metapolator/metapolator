/*!
 *  copyright 2012 abudaan http://abumarkub.net
 *  code licensed under MIT 
 *  http://abumarkub.net/midibridge/license
 * 
 *  MIDIBridge plugin that creates a dropdown menu for selecting MIDI inputs or MIDI outputs
 *  
 *  dependencies:
 *  - JazzMIDIBridge.js
 * 
 */

(function(mb){
    "use strict";

    mb.createMIDIDeviceSelector = function(select,devices,type,callback){
        var createOption,
            getSelectedDevice;
  
        //helper function
        createOption = function(id, label) {
            var option = document.createElement("option");
            option.setAttribute("id", id);
            option.innerHTML = label;
            return option;
        };
        
        //called when a device is selected in a drowdown menu
        getSelectedDevice = function(){
            var device = select.options[select.selectedIndex];
            return device.id;
        };

        //for IE8
        mb.wrapElement(select);

        //add the first option to the dropdown menu
        select.appendChild(createOption("-1", "choose a MIDI " + type));

        //loop over all devices and add them to the dropdown menu
        (function(){
            var i, maxi, device;
            for(i = 0, maxi = devices.length; i < maxi; i = i + 1) {
                device = devices[i];
                select.appendChild(createOption(i, device.deviceName));
            }            
        }());
              
        select.addEventListener("change", function(e) {
            callback(getSelectedDevice());
        }, false);
        
        return {
            getSelectedDevice:getSelectedDevice
        };
    };
    
}(JMB));