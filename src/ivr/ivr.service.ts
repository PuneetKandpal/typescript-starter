import { Injectable } from '@nestjs/common';
import { SupportAgentsService } from '../support-agents/support-agents.service';
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const twilio = require('twilio');

@Injectable()
export class IvrService {
    private twilioClient;

    constructor(private readonly supportAgentsService: SupportAgentsService) {
        // Initialize Twilio client if environment variables are available
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            console.log('✅ Twilio client initialized for outbound calls');
        } else {
            console.log('⚠️ Twilio client not initialized - outbound calls will not work');
        }
    }

    // New method to make outbound calls
    async makeOutboundCall(to: string, from: string = process.env.TWILIO_PHONE_NUMBER): Promise<any> {
        if (!this.twilioClient) {
            throw new Error('Twilio client not initialized. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
        }

        try {
            console.log(`📞 Making outbound call to ${to} from ${from}`);
            const call = await this.twilioClient.calls.create({
                to: to,
                from: from,
                url: `${process.env.BASE_URL || 'http://localhost:3050'}/ivr/welcome`,
                statusCallback: `${process.env.BASE_URL || 'http://localhost:3050'}/ivr/call-status`,
                statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
                statusCallbackMethod: 'POST',
                record: true,
                trim: 'trim-silence'
            });
            console.log(`✅ Outbound call initiated with SID: ${call.sid}`);
            return call;
        } catch (error) {
            console.error('❌ Error making outbound call:', error);
            throw error;
        }
    }

    generateWelcomeResponse(): string {
        console.log('🎯 Generating welcome response');
        const response = new VoiceResponse();
        const gather = response.gather({
            numDigits: 1,
            action: '/ivr/menu',
            method: 'POST'
        });

        const departments = this.supportAgentsService.getAllDepartments();
        console.log('Available departments:', departments);
        
        let message = 'Welcome to our support line. ';
        departments.forEach((dept, index) => {
            message += `Press ${index + 1} for ${dept}. `;
        });
        message += 'Press 0 to speak with any available agent.';

        gather.say(message, { loop: 3 });
        return response.toString();
    }

    handleMenuSelection(digit: string): string {
        try {
            console.log('🎯 Handling menu selection:', digit);
            const twiml = new VoiceResponse();
            
            if (digit === '0') {
                console.log('Selected option: Any available agent');
                const availableAgents = this.supportAgentsService.getAvailableAgents();
                console.log('Available agents:', availableAgents);
                
                if (availableAgents.length > 0) {
                    const agentNumber = availableAgents[0].phoneNumber;
                    console.log('Routing to agent:', agentNumber);
                    
                    // Ensure the number is in E.164 format
                    const formattedNumber = agentNumber.startsWith('+') ? agentNumber : `+${agentNumber}`;
                    
                    const dial = twiml.dial({
                        timeout: 30,
                        action: '/ivr/handle-dial-status',
                        method: 'POST',
                        statusCallback: '/ivr/call-status',
                        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed', 'failed'],
                        statusCallbackMethod: 'POST',
                        record: 'record-from-answer',
                        trim: 'trim-silence',
                        callerId: process.env.TWILIO_PHONE_NUMBER
                    }, formattedNumber);

                    // Add fallback behavior
                    //dial.say('We are unable to connect your call at this time. Please try again later.');
                    console.log('Dial twiml generated:', twiml.toString());
                } else {
                    console.log('No agents available');
                    twiml.say('Sorry, no agents are available at the moment. Please try again later.');
                    twiml.hangup();
                }
            } else {
                const departments = this.supportAgentsService.getAllDepartments();
                const selectedIndex = parseInt(digit) - 1;
                console.log('Selected department index:', selectedIndex);
                
                if (selectedIndex >= 0 && selectedIndex < departments.length) {
                    const department = departments[selectedIndex];
                    console.log('Selected department:', department);
                    const agent = this.supportAgentsService.getAgentByDepartment(department);
                    
                    if (agent) {
                        const agentNumber = agent.phoneNumber;
                        console.log('Routing to department agent:', agentNumber);
                        
                        // Ensure the number is in E.164 format
                        const formattedNumber = agentNumber.startsWith('+') ? agentNumber : `+${agentNumber}`;
                        
                        const dial = twiml.dial({
                            timeout: 30,
                            action: '/ivr/handle-dial-status',
                            method: 'POST',
                            statusCallback: '/ivr/call-status',
                            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
                            statusCallbackMethod: 'POST',
                            record: 'record-from-answer',
                            trim: 'trim-silence',
                            callerId: process.env.TWILIO_PHONE_NUMBER
                        }, formattedNumber);

                        // Add fallback behavior
                        //dial.say('We are unable to connect your call at this time. Please try again later.');
                        console.log('Dial twiml generated:', twiml.toString());
                    } else {
                        console.log('No agent available in department:', department);
                        twiml.say(`Sorry, no agents are available in ${department} at the moment. Please try again later.`);
                        twiml.hangup();
                    }
                } else {
                    console.log('Invalid selection');
                    twiml.say('Invalid selection. Please try again.');
                    twiml.redirect('/ivr/welcome');
                }
            }

            return twiml.toString();
        } catch (error) {
            console.error('❌ Error handling menu selection:', error);
            const errorTwiml = new VoiceResponse();
            errorTwiml.say('An error occurred. Please try again later.');
            errorTwiml.hangup();
            return errorTwiml.toString();
        }
    }
}
