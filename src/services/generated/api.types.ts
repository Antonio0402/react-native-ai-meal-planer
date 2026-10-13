// Được sinh từ FastAPI OpenAPI bằng npm run generate:api:offline; không sửa thủ công.
export interface paths {
    "/api/v1/recipes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Recipes */
        get: operations["list_recipes_api_v1_recipes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recipes/by-ids": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** User Recipes By Ids */
        post: operations["user_recipes_by_ids_api_v1_recipes_by_ids_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recipes/generated": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generated Recipes */
        post: operations["generated_recipes_api_v1_recipes_generated_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/recipes/match": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Match Recipes */
        post: operations["match_recipes_api_v1_recipes_match_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scan-jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Scan */
        post: operations["create_scan_api_v1_scan_jobs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scan-jobs/detect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Detect For Mobile */
        post: operations["detect_for_mobile_api_v1_scan_jobs_detect_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scan-jobs/{scan_job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read Scan */
        get: operations["read_scan_api_v1_scan_jobs__scan_job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/scan-jobs/{scan_job_id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm Scan */
        post: operations["confirm_scan_api_v1_scan_jobs__scan_job_id__confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me/data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get App Data */
        get: operations["get_app_data_api_v1_users_me_data_get"];
        /** Put App Data */
        put: operations["put_app_data_api_v1_users_me_data_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/users/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Profile */
        get: operations["get_profile_api_v1_users_me_profile_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Patch Profile */
        patch: operations["patch_profile_api_v1_users_me_profile_patch"];
        trace?: never;
    };
    "/api/v1/weekly-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Weekly Plan */
        get: operations["get_weekly_plan_api_v1_weekly_plans_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/weekly-plans/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate Weekly Plan */
        post: operations["generate_weekly_plan_api_v1_weekly_plans_generate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/weekly-plans/generate-from-inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate From Inventory */
        post: operations["generate_from_inventory_api_v1_weekly_plans_generate_from_inventory_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/weekly-plans/shopping/build": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Build Shopping From Plan */
        post: operations["build_shopping_from_plan_api_v1_weekly_plans_shopping_build_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/weekly-plans/{week_start}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Publish Weekly Plan */
        put: operations["publish_weekly_plan_api_v1_weekly_plans__week_start__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/weekly-plans/{week_start}/draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Put Weekly Draft */
        put: operations["put_weekly_draft_api_v1_weekly_plans__week_start__draft_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/weekly-plans/{week_start}/shopping-checks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Patch Shopping Checks */
        patch: operations["patch_shopping_checks_api_v1_weekly_plans__week_start__shopping_checks_patch"];
        trace?: never;
    };
    "/api/v1/weekly-plans/{week_start}/shopping-list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Shopping List */
        get: operations["get_shopping_list_api_v1_weekly_plans__week_start__shopping_list_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health Check */
        get: operations["health_check_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AppData */
        AppData: {
            /** Allergies */
            allergies: string[];
            /** Checked */
            checked: {
                [key: string]: boolean;
            };
            /** Inventory */
            inventory: components["schemas"]["Ingredient"][];
            /** Portions */
            portions: number;
            savedPlan?: components["schemas"]["SavedPlan"] | null;
            /** Slots */
            slots: {
                [key: string]: string;
            };
            /**
             * Weekstart
             * Format: date
             */
            weekStart: string;
        };
        /** AppDataResponse */
        AppDataResponse: {
            data: components["schemas"]["AppData"];
            /** Revision */
            revision: number;
        };
        /** Body_create_scan_api_v1_scan_jobs_post */
        Body_create_scan_api_v1_scan_jobs_post: {
            /** Image */
            image: string;
        };
        /** Body_detect_for_mobile_api_v1_scan_jobs_detect_post */
        Body_detect_for_mobile_api_v1_scan_jobs_detect_post: {
            /** File */
            file: string;
        };
        /** BuildShoppingInput */
        BuildShoppingInput: {
            /** Inventory */
            inventory: components["schemas"]["Ingredient"][];
            plan: components["schemas"]["SavedPlan"];
        };
        /** DraftPlanInput */
        DraftPlanInput: {
            /** Portions */
            portions: number;
            /** Slots */
            slots?: {
                [key: string]: string;
            };
        };
        /** ErrorDetail */
        ErrorDetail: {
            /** Code */
            code: string;
            /** Message */
            message: string;
        };
        /** ErrorResponse */
        ErrorResponse: {
            detail: components["schemas"]["ErrorDetail"];
            error: components["schemas"]["ErrorDetail"];
        };
        /** GenerateFromInventoryInput */
        GenerateFromInventoryInput: {
            /** Allergies */
            allergies: string[];
            /** Inventory */
            inventory: components["schemas"]["Ingredient"][];
            /** Portions */
            portions: number;
            /** Weekstart */
            weekStart?: string | null;
        };
        /** GeneratePlanInput */
        GeneratePlanInput: {
            /** Portions */
            portions: number;
            /**
             * Week Start
             * Format: date
             */
            week_start: string;
        };
        /** Ingredient */
        Ingredient: {
            /** Expiry */
            expiry?: string | null;
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Quantity */
            quantity?: number | null;
            /** Unit */
            unit: string;
        };
        /** MatchInput */
        MatchInput: {
            /** Allergies */
            allergies: string[];
            /** Inventory */
            inventory: components["schemas"]["Ingredient"][];
            /** Portions */
            portions: number;
        };
        /** MissingItem */
        MissingItem: {
            /** Check */
            check?: boolean | null;
            /** Name */
            name: string;
            /** Quantity */
            quantity: number;
            /** Unit */
            unit: string;
        };
        /** ProfilePatch */
        ProfilePatch: {
            /** Default Portions */
            default_portions: number;
        };
        /** PublishPlanInput */
        PublishPlanInput: {
            /** Expected Version */
            expected_version: number | null;
            /** Portions */
            portions: number;
            /** Slots */
            slots?: {
                [key: string]: string;
            };
        };
        /** Recipe */
        Recipe: {
            /** Id */
            id: string;
            /** Items */
            items: components["schemas"]["RecipeItem"][];
            /** Minutes */
            minutes: number;
            /** Servings */
            servings: number;
            /** Steps */
            steps: string[];
            /** Title */
            title: string;
        };
        /** RecipeIdsInput */
        RecipeIdsInput: {
            /** Ids */
            ids: string[];
        };
        /** RecipeItem */
        RecipeItem: {
            /** Name */
            name: string;
            /** Quantity */
            quantity: number;
            /** Unit */
            unit: string;
        };
        /** RecipeMatch */
        RecipeMatch: {
            /** Coverage */
            coverage: number;
            /** Items */
            items: components["schemas"]["RecipeItem"][];
            /** Missing */
            missing: components["schemas"]["MissingItem"][];
            recipe: components["schemas"]["Recipe"];
            /** Servings */
            servings: number;
        };
        /** RecipeSourceInput */
        RecipeSourceInput: {
            /** Allergies */
            allergies: string[];
            /** Inventory */
            inventory: components["schemas"]["Ingredient"][];
        };
        /** SavedPlan */
        SavedPlan: {
            /** Portions */
            portions: number;
            /** Slots */
            slots: {
                [key: string]: string;
            };
            /** Version */
            version: number;
            /**
             * Weekstart
             * Format: date
             */
            weekStart: string;
        };
        /** ScanCandidate */
        ScanCandidate: {
            /** Expiry */
            expiry?: string | null;
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Quantity */
            quantity?: number | null;
            /** Unit */
            unit: string;
        };
        /** ScanConfirmInput */
        ScanConfirmInput: {
            /** Items */
            items: components["schemas"]["ScanConfirmItem"][];
        };
        /** ScanConfirmItem */
        ScanConfirmItem: {
            /** Candidate Id */
            candidate_id?: string | null;
            /** Expiry Date */
            expiry_date?: string | null;
            /** Ingredient Id */
            ingredient_id?: string | null;
            /** Name */
            name: string;
            /** Quantity */
            quantity?: number | string | null;
            /** Unit Code */
            unit_code: string;
        };
        /** ShoppingCheckItem */
        ShoppingCheckItem: {
            /** Dimension Key */
            dimension_key: string;
            /**
             * Ingredient Id
             * Format: uuid
             */
            ingredient_id: string;
            /** Is Checked */
            is_checked: boolean;
        };
        /** ShoppingChecksInput */
        ShoppingChecksInput: {
            /** Items */
            items: components["schemas"]["ShoppingCheckItem"][];
            /**
             * Revision Id
             * Format: uuid
             */
            revision_id: string;
        };
        /** ShoppingItem */
        ShoppingItem: {
            /** Check */
            check: boolean;
            /** Group */
            group: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Tobuy */
            toBuy: number;
            /** Unit */
            unit: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    list_recipes_api_v1_recipes_get: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                q?: string | null;
            };
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    user_recipes_by_ids_api_v1_recipes_by_ids_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecipeIdsInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Recipe"][];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    generated_recipes_api_v1_recipes_generated_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecipeSourceInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Recipe"][];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_RATE_LIMITED: dịch vụ AI quá tải. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_OUTPUT_INVALID: kết quả AI không hợp lệ. */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_CONFIG_ERROR hoặc AI_PROVIDER_UNAVAILABLE. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_TIMEOUT: xử lý AI quá thời gian. */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    match_recipes_api_v1_recipes_match_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MatchInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecipeMatch"][];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_RATE_LIMITED: dịch vụ AI quá tải. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_OUTPUT_INVALID: kết quả AI không hợp lệ. */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_CONFIG_ERROR hoặc AI_PROVIDER_UNAVAILABLE. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_TIMEOUT: xử lý AI quá thời gian. */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    create_scan_api_v1_scan_jobs_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_create_scan_api_v1_scan_jobs_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    detect_for_mobile_api_v1_scan_jobs_detect_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_detect_for_mobile_api_v1_scan_jobs_detect_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScanCandidate"][];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description IMAGE_TOO_LARGE: tệp hoặc kích thước ảnh vượt giới hạn. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNSUPPORTED_MEDIA_TYPE: ảnh phải là JPEG, PNG hoặc WebP hợp lệ. */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_RATE_LIMITED: dịch vụ AI quá tải. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_OUTPUT_INVALID: kết quả AI không hợp lệ. */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_CONFIG_ERROR hoặc AI_PROVIDER_UNAVAILABLE. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_TIMEOUT: xử lý AI quá thời gian. */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    read_scan_api_v1_scan_jobs__scan_job_id__get: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                scan_job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    confirm_scan_api_v1_scan_jobs__scan_job_id__confirm_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                scan_job_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScanConfirmInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_app_data_api_v1_users_me_data_get: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppDataResponse"];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    put_app_data_api_v1_users_me_data_put: {
        parameters: {
            query?: never;
            header: {
                /** @description Revision hiện tại đặt trong dấu nháy kép, ví dụ "0". Revision cũ trả lỗi 412. */
                "If-Match": string;
                /** @description UUID của một lần lưu. Khi thử lại phải giữ cùng khóa và payload; đổi payload với cùng khóa trả lỗi 409. */
                "Idempotency-Key": string;
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppData"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppDataResponse"];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description IDEMPOTENCY_CONFLICT: khóa đã dùng cho payload khác; hoặc xung đột dữ liệu. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description REVISION_CONFLICT: revision đã thay đổi; tải lại dữ liệu trước khi lưu. */
            412: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_profile_api_v1_users_me_profile_get: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    patch_profile_api_v1_users_me_profile_patch: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfilePatch"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_weekly_plan_api_v1_weekly_plans_get: {
        parameters: {
            query: {
                week_start: string;
            };
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    generate_weekly_plan_api_v1_weekly_plans_generate_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GeneratePlanInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    generate_from_inventory_api_v1_weekly_plans_generate_from_inventory_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenerateFromInventoryInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_RATE_LIMITED: dịch vụ AI quá tải. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_OUTPUT_INVALID: kết quả AI không hợp lệ. */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_CONFIG_ERROR hoặc AI_PROVIDER_UNAVAILABLE. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description AI_TIMEOUT: xử lý AI quá thời gian. */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    build_shopping_from_plan_api_v1_weekly_plans_shopping_build_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BuildShoppingInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShoppingItem"][];
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    publish_weekly_plan_api_v1_weekly_plans__week_start__put: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                week_start: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PublishPlanInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    put_weekly_draft_api_v1_weekly_plans__week_start__draft_put: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                week_start: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DraftPlanInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    patch_shopping_checks_api_v1_weekly_plans__week_start__shopping_checks_patch: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                week_start: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ShoppingChecksInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    get_shopping_list_api_v1_weekly_plans__week_start__shopping_list_get: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path: {
                week_start: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Thiếu hoặc không xác minh được phiên Supabase. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu xung đột với trạng thái hiện tại. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Dữ liệu yêu cầu hoặc điều kiện nghiệp vụ không hợp lệ. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Lỗi nội bộ; chi tiết riêng tư không được trả về. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health_check_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
}
