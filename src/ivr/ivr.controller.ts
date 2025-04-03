import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { IvrService } from './ivr.service';

@Controller('ivr')
export class IvrController {
    constructor(private readonly ivrService: IvrService) {}

    @Get('welcome')
    async getWelcome() {
        console.log('📞 Welcome endpoint called');
        const response = this.ivrService.generateWelcomeResponse();
        console.log('Generated welcome response:', response);
        return response;
    }

    @Post('menu')
    async handleMenu(@Body('Digits') digit: string) {
        console.log('🔢 Menu selection received:', digit);
        const response = await this.ivrService.handleMenuSelection(digit);
        console.log('Generated menu response:', response);
        return response;
    }

    @Post('call-status')
    async handleCallStatus(@Body() statusData: any) {
        console.log('📞 Call status update:', statusData);
        if (statusData.ErrorCode) {
            console.error('❌ Call Error:', {
                code: statusData.ErrorCode,
                message: statusData.ErrorMessage,
                to: statusData.To,
                from: statusData.From
            });
        }
        return '';
    }

    @Post('handle-dial-status')
    async handleDialStatus(@Body() dialStatus: any) {
        console.log('🔔 Dial status:', dialStatus);
        if (dialStatus.DialCallStatus === 'failed') {
            console.error('❌ Dial Failed:', {
                errorCode: dialStatus.ErrorCode,
                errorMessage: dialStatus.ErrorMessage,
                to: dialStatus.Called,
                from: dialStatus.Caller
            });
        }
        return '';
    }

    @Post('outbound-call')
    async makeOutboundCall(@Body('to') to: string, @Body('from') from?: string) {
        console.log('📞 Outbound call requested to:', to);
        try {
            const result = await this.ivrService.makeOutboundCall(to, from);
            return { success: true, callSid: result.sid };
        } catch (error) {
            console.error('❌ Error making outbound call:', error);
            return { success: false, error: error.message };
        }
    }
}


