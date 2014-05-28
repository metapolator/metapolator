(function(global) {
    "use strict";

	var Jazz,//reference to the Jazz browser plugin
        JMB,//Jazz MIDI bridge wrapper
        MIDIAccess,//the wrapper object that mimics the future native MIDIAccess object in a browser
        scanDevices,
        createMIDIDevice,
        sendMIDIMessage,
        createMIDIMessage,
        logMIDIMessage,
        inputs = [],
        outputs = [],
        commands = [],
        //notenames in different modes
        noteNames = {
            "sharp" : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
            "flat" : ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"],
            "enh-sharp" : ["B#", "C#", "C##", "D#", "D##", "E#", "F#", "F##", "G#", "G##", "A#", "A##"],
            "enh-flat" : ["D♭♭", "D♭", "E♭♭", "E♭", "F♭", "G♭♭", "G♭", "A♭♭", "A♭", "B♭", "B♭", "C♭"]
        },
        version = "0.1";

    //human readable representation of the midi commands (the upper 4 bits of the status byte)
    commands[0x80] = "NOTE OFF";
    commands[0x90] = "NOTE ON";
    commands[0xA0] = "POLY PRESSURE";
    commands[0xB0] = "CONTROL CHANGE";
    commands[0xC0] = "PROGRAM CHANGE";
    commands[0xD0] = "CHANNEL PRESSURE";
    commands[0xE0] = "PITCH BEND";
    commands[0xF0] = "SYSTEM EXCLUSIVE";


    //make sure that IE9 doesn't hang on uncommented console.log() statements
    try {
        console.log("");
    } catch (e) {
        console = {
            'log': function(args) {}
        };
    }       

    //creates a wrapper object for MIDI in- and outputs
    createMIDIDevice = function(index,type,name){
        var device = {
            index: index,
            deviceType: type,
            deviceName: name,
            isOpen: false        
        },

        addEventListener = function(eventId,device,callback){
            var BYTES_PER_MSG = 3;
            if(eventId === "midimessage"){
                Jazz.MidiInOpen(device.index,function(timestamp, midi_bytes){
                    var num_msgs = midi_bytes.length / BYTES_PER_MSG,
                        msg_num,
                        byte_idx,
                        status_byte, 
                        command, 
                        channel, 
                        data = [];

                    for(msg_num=0, byte_idx=0; msg_num < num_msgs; msg_num++, byte_idx+=3) {
                        status_byte = midi_bytes[byte_idx];
                        command = status_byte & 0xF0; // higher 4 bits is command
                        channel = status_byte & 0xF; // lower 4 bits is channel
                        data = [ midi_bytes[byte_idx+1], midi_bytes[byte_idx+2] ]; // data after status byte

                        callback(createMIDIMessage(command, data[0], data[1], channel, timestamp));
                    }
                });                
            }
        },

        sendMIDIMessage = function(device, message){
            if(device.isOpen === false){
                device.open();
            }
            Jazz.MidiOut(message.status, message.data1, message.data2);
            //console.log(message.toString());
        },

        openInput = function(device){
            device.isOpen = true;  
        },

        openOutput = function(device){
            device.device = Jazz.MidiOutOpen(index);   
            device.isOpen = true;  
        },
        
        closeOutput = function(device){
            if(device.isOpen){
                //Jazz.MidiOutClose(index);
                Jazz.MidiOutClose(); 
            }   
            device.isOpen = false;  
        },

        closeInput = function(device){
            if(device.isOpen){
                Jazz.MidiInClose(); 
            }   
            device.isOpen = false;  
        };

        if(type === "INPUT"){
            device.addEventListener = function(eventId,callback){
                addEventListener(eventId,device,callback);
            };
            device.open = function(){
                openInput(device);
            };
            device.close = function(){
                closeInput(device);
            };
        }else if(type === "OUTPUT"){
            device.sendMIDIMessage = function(message){
                sendMIDIMessage(device,message);
            };
            device.open = function(){
                openOutput(device);
            };
            device.close = function(){
                closeOutput(device);
            };
        }
        return device;
    };

    //scans all currently available MIDI devices
    scanDevices = function(){
		var name,
			list;
        //get inputs
        list = Jazz.MidiInList();
        for(name in list){
            if(list.hasOwnProperty(name)){
                inputs.push(createMIDIDevice(name,"INPUT",list[name]));
            }
        }
        //get outputs
        list = Jazz.MidiOutList();
        for(name in list){
            if(list.hasOwnProperty(name)){
                outputs.push(createMIDIDevice(name,"OUTPUT",list[name]));
            }
		}
    };

    logMIDIMessage = function(msg){
        return 'command:' + commands[msg.command] + ' channel:' + msg.channel + ' data1:' + msg.data1 + ' data2:' + msg.data2 + ' timestamp:' + msg.timestamp;
    };

    //@TODO add constructor (short status, Uint8Array data, timeStamp = CURRENT_TIME)
    createMIDIMessage = function(command,data1,data2,channel,timestamp){
        var message = {
            command: command,
            status: parseInt(command) + (parseInt(channel) || 0),
            channel: channel || 0,
            data1: data1,
            data2: data2,
            timestamp: timestamp || 0
        };
        message.toString = function(){
            return logMIDIMessage(message);
        };
        //console.log(message.status,message.command,message.channel);
        return message;
    };

    //the wrapper object that mimics the future native MIDIAccess object in a browser
    MIDIAccess = {
        enumerateInputs: function(){
            return inputs;
        },
        
        enumerateOutputs: function(){
            return outputs;
        },
        //@TODO getInput and getOutput with device name and device
        getInput: function(index){
            if(index < 0 || index >= inputs.length){
                return false;
            }
            var input = inputs[index];
            if(input.isOpen === false){
                input.open();
            }
            return input;
        },

        getOutput: function(index){
            if(index < 0 || index >= outputs.length){
                return false;
            }
            var output = outputs[index];
            if(output.isOpen === false){
                output.open();
            }
            return output;
        },
        
        createMIDIMessage: createMIDIMessage
    };    

    JMB = {
        // MIDI Commands:
        NOTE_OFF : 0x80, //128
        NOTE_ON : 0x90, //144
        POLY_PRESSURE : 0xA0, //160
        CONTROL_CHANGE : 0xB0, //176
        PROGRAM_CHANGE : 0xC0, //192
        CHANNEL_PRESSURE : 0xD0, //208
        PITCH_BEND : 0xE0, //224
        SYSTEM_EXCLUSIVE : 0xF0, //240
        MIDI_TIMECODE : 241,
        SONG_POSITION : 242,
        SONG_SELECT : 243,
        TUNE_REQUEST : 246,
        EOX : 247,
        TIMING_CLOCK : 248,
        START : 250,
        CONTINUE : 251,
        STOP : 252,
        ACTIVE_SENSING : 254,
        SYSTEM_RESET : 255,
        
        // Note name modes:
        NOTE_NAMES_SHARP : "sharp",
        NOTE_NAMES_FLAT : "flat",
        NOTE_NAMES_SOUNDFONT : "soundfont",
        NOTE_NAMES_ENHARMONIC_SHARP : "enh-sharp",
        NOTE_NAMES_ENHARMONIC_FLAT : "enh-flat",
        
        noteNameMode : "sharp",

        init: function(callback,onerror){

            var jazz1Obj = document.createElement("object"),
                jazz2Obj = document.createElement("object");

            //embed for IE
            jazz1Obj.setAttribute("classid","CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90");
            jazz1Obj.setAttribute("style","margin-left:-1000px;");
            
            //embed for all other browsers
            jazz2Obj.setAttribute("type","audio/x-jazz");
            jazz2Obj.setAttribute("style","visibility:hidden;");

            jazz1Obj.appendChild(jazz2Obj);
            document.body.appendChild(jazz1Obj);
            
            Jazz = jazz1Obj;
            if(!Jazz || !Jazz.isJazz){
                Jazz = jazz2Obj;
            }
            if(Jazz){
                scanDevices();
                callback(MIDIAccess);
            }else if(onerror !== undefined){
                onerror("No Jazz plugin detected, please visit http://jazzplugin.net");               
            }else{
                alert("No Jazz plugin detected, please visit http://jazzplugin.net");
            }
        },

        rescan: function(){
            scanDevices();
        },

        getNoteName: function(noteNumber, mode) {
            mode = mode || JMB.noteNameMode;
            var octave = Math.floor(((noteNumber) / 12) - 1),
                noteName = noteNames[mode][noteNumber % 12];
            return noteName + octave;
        },

        getNoteNumber: function(noteName, octave) {
            var index = -1,
                key,
                mode,
                i,max,
                noteNumber;
            noteName = noteName.toUpperCase();
            for(key in noteNames) {
                if(noteNames.hasOwnProperty(key)){
                    mode = noteNames[key];
                    for(i = 0, max = mode.length; i < max; i = i + 1) {
                        if(mode[i] === noteName) {
                            index = i;
                            break;
                        }
                    }                    
                }
            }
            if(index === -1) {
                return "invalid note name";
            }
            noteNumber = (12 + index) + (octave * 12);
            return noteNumber;
        },

        getCommand: function(status) {
            //the higher 4 bits of the status byte is the command
            return commands[(status >> 4) * 16];
        },

        getChannel: function(status) {
            //the lower 4 bits of the status byte is the channel
            return status & 0xF;
        },

        getVersion: function(){
            return version;
        },

        getJazz: function(){
            return Jazz;
        },

        getJazzVersion: function(){
            return Jazz.version;
        },

        getTime: function(){
            return Jazz.Time();
        },

        wrapElement: function(element){
            if(element.addEventListener !== undefined){
                return;
            }
            element.addEventListener = function(id, callback, bubble){
                element.attachEvent(id, callback);
            };
        }
    };

    //add addEventListener to IE8
    JMB.wrapElement(global);

	// Support for AMD (async module definition)
	if(typeof define === 'function' && define.amd) {
		define(JMB);
	} else {
		global.JMB = JMB;
	}
})(this);
