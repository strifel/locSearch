{
  description = "A location finding game.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } {
    systems = import inputs.systems;
    imports = [ ];

    perSystem = { self', pkgs, lib, ... }: {
      devShells.default = pkgs.mkShellNoCC {
        packages = [
          pkgs.nodejs_21
          pkgs.prefetch-npm-deps
        ];
      };

      packages.default = pkgs.buildNpmPackage rec {
        pname = "locsearch";
        version = "1.0.0";

        src = inputs.self;

        npmDepsHash = "sha256-QnpGqEDbUT/MpMQgOSUt1ObeiTpCNC9Z1RCalgNzros=";

        dontNpmBuild = true;  # this doesn't have a build script

        meta = {
          description = "A location finding game.";
          homepage = "https://github.com/strifel/locSearch";
          license = lib.licenses.mit;
        };
      };
      apps.default = {
        type = "app";
        program = "${self'.packages.default}/bin/locsearch";
      };
    };
    flake.nixosModules.default = import ./nixos-module.nix inputs.self;
  };
}
