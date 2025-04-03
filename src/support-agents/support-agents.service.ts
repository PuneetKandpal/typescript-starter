import { Injectable } from '@nestjs/common';
import { SupportAgent } from './interfaces/support-agent.interface';

@Injectable()
export class SupportAgentsService {
    private readonly supportAgents: SupportAgent[] = [
        {
            id: '1',
            name: 'Saurav',
            phoneNumber: '+918800804795',
            department: 'Technical Support',
            isAvailable: true
        },
        {
            id: '2',
            name: 'Nitin Sir',
            phoneNumber: '+919654755597',
            department: 'Business Development',
            isAvailable: true
        },
        {
            id: '3',
            name: 'Rajesh',
            phoneNumber: '+918800804795',
            department: 'Sales',
            isAvailable: false
        }
    ];

    getAvailableAgents(): SupportAgent[] {
        return this.supportAgents.filter(agent => agent.isAvailable);
    }

    getAgentByDepartment(department: string): SupportAgent | undefined {
        return this.supportAgents.find(agent => 
            agent.department.toLowerCase() === department.toLowerCase() && 
            agent.isAvailable
        );
    }

    getAllDepartments(): string[] {
        return [...new Set(this.supportAgents.map(agent => agent.department))];
    }
}
