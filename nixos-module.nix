self:

{ pkgs, lib, config, ... }:

{
  options.services.locsearch = {
    enable = lib.mkEnableOption (lib.mdDoc "locsearch, a location finding game.");
    package = lib.mkOption {
      description = "The locsearch package to use.";
      type = lib.types.package;
      default = self.packages.${pkgs.hostPlatform.system}.default;
    };
  };

  config = let
    cfg = config.services.locsearch;
  in lib.mkIf cfg.enable {
    systemd.services.locsearch = {
      description = "locsearch";
      wantedBy = [ "multi-user.target" ];
      after = [ "networking.target" ];
      serviceConfig = {
        DynamicUser = true;
        StateDirectory = "locsearch";
        WorkingDirectory = "/var/lib/private/locsearch";
        ExecStart = "${cfg.package}/bin/locsearch";
        Restart = "always";
      };
    };
  };
}
