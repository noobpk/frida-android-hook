//Serhatcck/java-crypto-viewer

Java.perform(function(){
    var base64 = Java.use('java.util.Base64');
    
    var cipher = Java.use("javax.crypto.Cipher");
    
    cipher.init.overload('int', 'java.security.Key').implementation = function(opmode,key){
        send_log("Key",base64.getEncoder().encodeToString(key.getEncoded()));
        send_log("Opmode String",this.getOpmodeString(opmode));
        send_log("Algorithm",this.getAlgorithm());

        this.init.overload('int', 'java.security.Key').call(this,opmode,key);
    }
    
    cipher.init.overload('int', 'java.security.cert.Certificate').implementation = function(opmode,certificate){
        send_log("Certificate",base64.getEncoder().encodeToString(certificate.getEncoded()));
        send_log("Opmode String",this.getOpmodeString(opmode));
        send_log("Algorithm",this.getAlgorithm());

        this.init.overload('int', 'java.security.cert.Certificate').call(this,opmode,certificate)
    }
    
    cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters').implementation = function(opmode,key,algorithmParameter){
        send_log("Key",base64.getEncoder().encodeToString(key.getEncoded()));
        send_log("Opmode String",this.getOpmodeString(opmode));
        send_log("Algorithm",this.getAlgorithm());

        this.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters').call(this,opmode,key,algorithmParameter);
    }


    cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function(opmode,key,algorithmParameter){
        send_log("Key",base64.getEncoder().encodeToString(key.getEncoded()));
        send_log("Opmode String",this.getOpmodeString(opmode));
        send_log("Algorithm",this.getAlgorithm());
        this.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').call(this,opmode,key,algorithmParameter);
    }


   


    cipher.doFinal.overload('[B').implementation = function(input){
        var input_base64 = base64.getEncoder().encodeToString(input);
        var input_string = byte_to_string(input);
        var output = this.doFinal.overload('[B').call(this,input);
        var output_base64 = base64.getEncoder().encodeToString(output);
        send_log("Input Base64",input_base64);
        send_log("Input String",input_string);
        send_log("Output Base64",output_base64);
        send_log("----------------","----------------");
        return output;
    }

    cipher.doFinal.overload('[B', 'int').implementation = function(input,input2){
        var input_base64 = base64.getEncoder().encodeToString(input);
        var input_string = byte_to_string(input);
        var output = this.doFinal.overload('[B', 'int').call(this,input,input2);
        var output_base64 = base64.getEncoder().encodeToString(output);
        send_log("Input Base64",input_base64);
        send_log("Input String",input_string);
        send_log("Output Base64",output_base64);
        send_log("----------------","----------------");
        return output;
    }

    cipher.doFinal.overload('[B', 'int', 'int').implementation = function(input,input2,input3){
        var input_base64 = base64.getEncoder().encodeToString(input);
        var input_string = byte_to_string(input);
        var output = this.doFinal.overload('[B', 'int', 'int').call(this,input,input2,input3);
        var output_base64 = base64.getEncoder().encodeToString(output);
        send_log("Input Base64",input_base64);
        send_log("Input String",input_string);
        send_log("Output Base64",output_base64);
        send_log("----------------","----------------");
        return output;
    }

    cipher.doFinal.overload('[B', 'int', 'int', '[B').implementation = function(input,input2,input3,input4){
        var input_base64 = base64.getEncoder().encodeToString(input);
        var input_string = byte_to_string(input);
        var output = this.doFinal.overload('[B', 'int', 'int', '[B').call(this,input,input2,input3,input4);
        var output_base64 = base64.getEncoder().encodeToString(output);
        send_log("Input Base64",input_base64);
        send_log("Input String",input_string);
        send_log("Output Base64",output_base64);
        send_log("----------------","----------------");
        return output;
    }

    cipher.doFinal.overload('[B', 'int', 'int', '[B', 'int').implementation = function(input,input2,input3,input4,input5){
        var input_base64 = base64.getEncoder().encodeToString(input);
        var input_string = byte_to_string(input);
        var output = this.doFinal.overload('[B', 'int', 'int', '[B', 'int').call(this,input,input2,input3,input4,input5);
        var output_base64 = base64.getEncoder().encodeToString(output);
        send_log("Input Base64",input_base64);
        send_log("Input String",input_string);
        send_log("Output Base64",output_base64);
        send_log("----------------","----------------");
        return output;
    }


    
    var ivParameter =  Java.use('javax.crypto.spec.IvParameterSpec');
 

    ivParameter.$init.overload('[B').implementation = function(ivKey){
        send_log("Iv Key",base64.getEncoder().encodeToString(ivKey));
        this.$init.overload('[B').call(this,ivKey);
    }

    
    
})

function send_log(string, value){
    console.log("[+] "+string+" : "+value);
}



function byte_to_string(byte_array){
    var StringClass = Java.use('java.lang.String');
    return StringClass.$new(byte_array).toString();
}