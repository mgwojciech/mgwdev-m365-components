import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DataverseRecordService } from '../../../src/services/dataverse/DataverseRecordService';

describe('DataverseRecordService', () => {
    const dataverseEnv = 'https://contoso.crm.dynamics.com';
    const entitySetName = 'accounts';
    let dataverseClient: {
        get: ReturnType<typeof vi.fn>;
        post: ReturnType<typeof vi.fn>;
        patch: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        dataverseClient = {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
        };
    });

    test('should get a record with select and expand parameters', async () => {
        const payload = { accountid: '123', name: 'Contoso' };
        dataverseClient.get.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(payload),
        });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);
        const result = await service.getRecord('123', 'name,accountid', 'primarycontactid');

        expect(result).toEqual(payload);
        expect(dataverseClient.get).toHaveBeenCalledTimes(1);
        expect(dataverseClient.get).toHaveBeenCalledWith(
            `${dataverseEnv}/api/data/v9.2/${entitySetName}(123)?$select=name,accountid&$expand=primarycontactid`,
            {
                headers: expect.objectContaining({
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    prefer: 'odata.include-annotations=*',
                }),
            }
        );
    });

    test('should throw when getRecord request fails', async () => {
        dataverseClient.get.mockResolvedValue({ ok: false });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);

        await expect(service.getRecord('123')).rejects.toThrow('Failed to load record 123 from accounts');
    });

    test('should create a record', async () => {
        const payload = { name: 'Contoso' };
        const createdRecord = { accountid: '123', name: 'Contoso' };
        dataverseClient.post.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createdRecord),
        });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);
        const result = await service.createRecord(payload);

        expect(result).toEqual(createdRecord);
        expect(dataverseClient.post).toHaveBeenCalledTimes(1);
        expect(dataverseClient.post).toHaveBeenCalledWith(
            `${dataverseEnv}/api/data/v9.2/${entitySetName}`,
            {
                headers: expect.objectContaining({
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation',
                }),
                body: JSON.stringify(payload),
            }
        );
    });

    test('should throw when createRecord request fails', async () => {
        const payload = { name: 'Contoso' };
        dataverseClient.post.mockResolvedValue({ ok: false });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);

        await expect(service.createRecord(payload)).rejects.toThrow('Failed to create accounts record');
    });

    test('should update a single lookup field using odata.bind', async () => {
        const payload = {
            'primarycontactid@odata.bind': '/contacts(456)',
        };
        const updatedRecord = { accountid: '123', primarycontactid: '456' };
        dataverseClient.patch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(updatedRecord),
        });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);
        const result = await service.updateRecord('123', payload);

        expect(result).toEqual(updatedRecord);
        expect(dataverseClient.patch).toHaveBeenCalledWith(
            `${dataverseEnv}/api/data/v9.2/${entitySetName}(123)`,
            {
                headers: expect.objectContaining({
                    Prefer: 'return=representation',
                }),
                body: JSON.stringify(payload),
            }
        );
    });

    test('should update a record', async () => {
        const payload = { name: 'Updated Contoso' };
        const updatedRecord = { accountid: '123', name: 'Updated Contoso' };
        dataverseClient.patch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(updatedRecord),
        });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);
        const result = await service.updateRecord('123', payload);

        expect(result).toEqual(updatedRecord);
        expect(dataverseClient.patch).toHaveBeenCalledTimes(1);
        expect(dataverseClient.patch).toHaveBeenCalledWith(
            `${dataverseEnv}/api/data/v9.2/${entitySetName}(123)`,
            {
                headers: expect.objectContaining({
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation',
                }),
                body: JSON.stringify(payload),
            }
        );
    });

    test('should throw when updateRecord request fails', async () => {
        dataverseClient.patch.mockResolvedValue({ ok: false });

        const service = new DataverseRecordService(dataverseClient as any, dataverseEnv, entitySetName);

        await expect(service.updateRecord('123', { name: 'Updated Contoso' })).rejects.toThrow('Failed to update accounts record 123');
    });
});
