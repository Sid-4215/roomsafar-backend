package com.roomsafar.room_service.enums;

public enum Amenity {
    // Basic
    WIFI("WiFi", "wifi"),
    AC("Air Conditioner", "ac"),
    GEYSER("Geyser", "geyser"),
    WASHING_MACHINE("Washing Machine", "washing_machine"),
    REFRIGERATOR("Refrigerator", "refrigerator"),
    MICROWAVE("Microwave", "microwave"),
    TV("Television", "tv"),
    CUPBOARD("Cupboard", "cupboard"),
    
    // Facilities
    LIFT("Lift", "lift"),
    PARKING("Parking", "parking"),
    SECURITY("Security", "security"),
    CCTV("CCTV", "cctv"),
    HOUSEKEEPING("Housekeeping", "housekeeping"),
    
    // Room specific
    ATTACHED_BATHROOM("Attached Bathroom", "attached_bathroom"),
    BALCONY("Balcony", "balcony"),
    STUDY_TABLE("Study Table", "study_table"),
    
    // Utilities
    WATER_PURIFIER("Water Purifier", "water_purifier"),
    INVERTER("Inverter/Generator", "inverter"),
    
    // Rules
    NO_NON_VEG("No Non-Veg", "no_non_veg"),
    NO_SMOKING("No Smoking", "no_smoking"),
    NO_ALCOHOL("No Alcohol", "no_alcohol"),
    NO_OUTSIDERS("No Outsiders", "no_outsiders");
    
    private final String displayName;
    private final String iconName;
    
    Amenity(String displayName, String iconName) {
        this.displayName = displayName;
        this.iconName = iconName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getIconName() {
        return iconName;
    }
}