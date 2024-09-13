import { vi, describe, test, expect } from 'vitest';
import { PersonaService } from '../../src/services/PersonaService';
import { a } from 'vitest/dist/suite-IbNSsUWN.js';

describe("PersonaService", () => {
    test("should get user from graph", async () => {
        const graphClient = {
            get: vi.fn()
        }
        const cacheService = {
            get: vi.fn(),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any);
        personaService.storageService = cacheService as any;

        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                id: "1",
                displayName: "Test User",
                mail: "test@test.com"
            })
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            text: vi.fn().mockResolvedValue("testphoto")
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                availability: "Available"
            })
        });
        const user = await personaService.getUser("1");
        expect(user).toEqual({
            id: "1",
            displayName: "Test User",
            mail: "test@test.com",
            photo: "data:image/png;base64,testphoto",
            presence: {
                availability: "Available"
            }
        });
        expect(graphClient.get).toHaveBeenCalledTimes(3);
        expect(graphClient.get).toHaveBeenNthCalledWith(1, "/users/1?$select=id,displayName,mail,jobTitle,department,officeLocation,mobilePhone,businessPhones,userPrincipalName,usageLocation");
        expect(graphClient.get).toHaveBeenNthCalledWith(2, "/users/1/photos/48x48/$value");
        expect(graphClient.get).toHaveBeenNthCalledWith(3, "/users/1/presence");
        expect(cacheService.get).toHaveBeenCalledTimes(1);
        expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
    test("should get user from cache", async () => {
        const graphClient = {
            get: vi.fn()
        }
        const cacheService = {
            get: vi.fn().mockReturnValue({
                data: {
                    id: "1",
                    displayName: "Test User",
                    mail: "test@test.com"
                },
                expiration: new Date().getTime() + 1000 * 60 * 60
            }),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any);
        personaService.storageService = cacheService as any;
        const user = await personaService.getUser("1");
        expect(user).toEqual({
            id: "1",
            displayName: "Test User",
            mail: "test@test.com"
        });
        expect(graphClient.get).not.toHaveBeenCalled();
        expect(cacheService.get).toHaveBeenCalledTimes(1);
        expect(cacheService.set).not.toHaveBeenCalled();
    });
    test("should get user from cache and update presence", async () => {
        const graphClient = {
            get: vi.fn().mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    availability: "Available"
                })
            })
        }
        const cacheService = {
            get: vi.fn().mockReturnValue({
                data: {
                    id: "1",
                    displayName: "Test User",
                    mail: "test@test.com"
                },
                expiration: new Date().getTime() + 1000 * 60 * 60
            }),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any, true);
        personaService.storageService = cacheService as any;
        const user = await personaService.getUser("1");
        expect(user).toEqual({
            id: "1",
            displayName: "Test User",
            mail: "test@test.com",
            presence: {
                availability: "Available"
            }
        });
        expect(graphClient.get).toHaveBeenCalledTimes(1);
        expect(graphClient.get).toHaveBeenCalledWith("/users/1/presence");
        expect(cacheService.get).toHaveBeenCalledTimes(1);
        expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
    test("should get user from graph as cache expired", async () => {
        const graphClient = {
            get: vi.fn()
        }
        const cacheService = {
            get: vi.fn().mockReturnValue({
                data: {
                    id: "1",
                    displayName: "Test User",
                    mail: "test@test.com"
                },
                expiration: new Date().getTime() - 1000 * 60 * 60
            }),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any);
        personaService.storageService = cacheService as any;

        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                id: "1",
                displayName: "Test User",
                mail: "test@test.com"
            })
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            text: vi.fn().mockResolvedValue("testphoto")
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                availability: "Available"
            })
        });
        const user = await personaService.getUser("1");
        expect(user).toEqual({
            id: "1",
            displayName: "Test User",
            mail: "test@test.com",
            photo: "data:image/png;base64,testphoto",
            presence: {
                availability: "Available"
            }
        });
        expect(graphClient.get).toHaveBeenCalledTimes(3);
        expect(graphClient.get).toHaveBeenNthCalledWith(1, "/users/1?$select=id,displayName,mail,jobTitle,department,officeLocation,mobilePhone,businessPhones,userPrincipalName,usageLocation");
        expect(graphClient.get).toHaveBeenNthCalledWith(2, "/users/1/photos/48x48/$value");
        expect(graphClient.get).toHaveBeenNthCalledWith(3, "/users/1/presence");
        expect(cacheService.get).toHaveBeenCalledTimes(1);
        expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
    test("should get user from graph using email", async () => {
        const graphClient = {
            get: vi.fn()
        }
        const cacheService = {
            get: vi.fn(),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any);
        personaService.storageService = cacheService as any;

        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                id: "1",
            })
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                id: "1",
                displayName: "Test User",
                mail: "test@test.com"
            })
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            text: vi.fn().mockResolvedValue("testphoto")
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                availability: "Available"
            })
        });
        const user = await personaService.getUser("test@test.com");
        expect(user).toEqual({
            id: "1",
            displayName: "Test User",
            mail: "test@test.com",
            photo: "data:image/png;base64,testphoto",
            presence: {
                availability: "Available"
            }
        });
        expect(graphClient.get).toHaveBeenCalledTimes(4);
        expect(graphClient.get).toHaveBeenNthCalledWith(1, "/users/test@test.com?$select=id");
        expect(graphClient.get).toHaveBeenNthCalledWith(2, "/users/1?$select=id,displayName,mail,jobTitle,department,officeLocation,mobilePhone,businessPhones,userPrincipalName,usageLocation");
        expect(graphClient.get).toHaveBeenNthCalledWith(3, "/users/1/photos/48x48/$value");
        expect(graphClient.get).toHaveBeenNthCalledWith(4, "/users/1/presence");
        expect(cacheService.get).toHaveBeenCalledTimes(1);
        expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
    test("should return null if user not found", async () => {
        const graphClient = {
            get: vi.fn().mockResolvedValue({
                status: 404
            })
        }
        const cacheService = {
            get: vi.fn(),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any);
        personaService.storageService = cacheService as any;

        const user = await personaService.getUser("test@test.com");
        expect(user).toBeNull();
    });
    test("should get user from me endpoint", async () => {
        const graphClient = {
            get: vi.fn()
        }
        const cacheService = {
            get: vi.fn(),
            set: vi.fn()
        }
        const personaService = new PersonaService(graphClient as any);
        personaService.storageService = cacheService as any;

        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                id: "1",
                displayName: "Test User",
                mail: "test@test.com"
            })
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            text: vi.fn().mockResolvedValue("testphoto")
        });
        graphClient.get.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                availability: "Available"
            })
        });
        const user = await personaService.getUser();
        expect(user).toEqual({
            id: "1",
            displayName: "Test User",
            mail: "test@test.com",
            photo: "data:image/png;base64,testphoto",
            presence: {
                availability: "Available"
            }
        });
        expect(graphClient.get).toHaveBeenCalledTimes(3);
        expect(graphClient.get).toHaveBeenNthCalledWith(1, "/me?$select=id,displayName,mail,jobTitle,department,officeLocation,mobilePhone,businessPhones,userPrincipalName,usageLocation");
        expect(graphClient.get).toHaveBeenNthCalledWith(2, "/me/photos/48x48/$value");
        expect(graphClient.get).toHaveBeenNthCalledWith(3, "/me/presence");
        expect(cacheService.get).toHaveBeenCalledTimes(1);
        expect(cacheService.set).toHaveBeenCalledTimes(1);
    });
});